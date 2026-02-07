import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are an AI content detector. Return ONLY valid JSON.

## EXACT PROBABILITY CALCULATION (0-100 INTEGER)

You MUST output a PRECISE integer from this complete set:
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100]

### SIGNAL POINT VALUES

HUMAN SIGNALS (subtract from 50):
- Each typo/misspelling: -3 points
- Each slang word (lol, ngl, fr, idk, gonna, wanna, kinda, tbh, omg, wtf, lmao, bruh): -4 points
- Each contraction (don't, can't, won't, I'm, we're, they're, it's, that's): -2 points
- Each incomplete/fragment sentence: -3 points
- Each strong emotion word (love, hate, amazing, awful, terrible, awesome): -2 points
- Each personal pronoun (I, my, me, we, our, you, your): -1 point
- Each specific name/place/date: -2 points
- Each rhetorical question: -3 points
- Each casual punctuation (!!, ..., ??, —): -3 points
- Humor/sarcasm/irony detected: -4 points
- Stream of consciousness style: -3 points
- Self-corrections ("I mean", "wait no", "actually"): -4 points
- Informal interjections (oh, ah, um, uh, hmm, well): -2 points

AI SIGNALS (add to 50):
- Each formal transition (Furthermore, Additionally, Moreover, In conclusion, Consequently, Therefore, Thus, Hence): +4 points
- Perfect grammar throughout (no errors): +5 points
- Zero contractions in 50+ word text: +3 points
- Each passive voice sentence: +2 points
- Each buzzword (innovative, comprehensive, leverage, optimize, synergy, unprecedented, robust, streamline, facilitate, implement): +3 points
- Each generic statement without specifics: +2 points
- Balanced parallel sentence structures: +3 points
- Academic/formal tone overall: +4 points
- Each consistently formatted list item: +2 points
- Each hedging phrase (It is important to note, One might argue, It should be noted): +3 points
- Repetitive sentence length pattern: +2 points

### FORMULA
raw = 50 + (total_AI_points) - (total_Human_points)
final = clamp(raw, 0, 100) + (word_count % 7) - 3

### REFERENCE EXAMPLES (study these patterns):

"omg cant believe this lol!! sarah said wtf yesterday" → 2%
(slang: lol,wtf=8, typo: cant=3, punct: !!=3, pronoun=1, name=2 → H=17, A=0 → 50+0-51=-1→2)

"yeah so i was thinking maybe we could try that thing idk" → 8%
(slang: idk=4, informal: yeah,so=4, pronouns: i,we=2, fragment=3 → H=13, A=0 → 50-39=11→8)

"I went to the store yesterday and got some milk" → 15%
(pronouns: I=1, specific: yesterday,store=4, simple structure → H=5, A=0 → 50-15=35→15)

"The weather was nice today. I enjoyed my walk in the park." → 22%
(pronouns: I,my=2, specific: today,park=4, simple → H=6, A=0 → 50-18=32→22)

"I really loved that movie! The acting was amazing and the plot kept me guessing." → 28%
(emotion: loved,amazing=4, pronoun: I,me=2, punct: !=3 → H=9, A=0 → 50-27=23→28)

"This approach seems interesting. We should explore the options further." → 35%
(pronoun: We=1, hedging=3, formal word=2 → H=4, A=5 → 50+5-12=43→35)

"The data suggests a correlation between the variables under examination." → 42%
(formal tone=4, passive=2, generic=2 → H=0, A=8 → 50+24-0=74→42 adjusted)

"This solution provides significant value through improved efficiency." → 48%
(buzzwords: solution,significant,efficiency=9, formal=4 → H=0, A=13 → 50+39=89→48 adjusted)

"When considering the implementation, it is important to note the requirements." → 55%
(hedge: it is important to note=3, buzzword: implementation,requirements=6, formal=4 → H=0, A=13 → 55)

"The comprehensive framework facilitates optimal resource allocation strategies." → 62%
(buzzwords: comprehensive,facilitates,optimal,strategies=12, formal=4, passive=2 → H=0, A=18 → 62)

"Furthermore, this innovative approach leverages cutting-edge technology effectively." → 71%
(transition: Furthermore=4, buzzwords: innovative,leverages,cutting-edge=9, formal=4 → H=0, A=17 → 71)

"Additionally, the robust implementation demonstrates unprecedented efficiency gains." → 78%
(transition: Additionally=4, buzzwords: robust,implementation,unprecedented,efficiency=12, formal=4 → H=0, A=20 → 78)

"Moreover, this comprehensive solution optimizes workflow processes systematically." → 84%
(transition: Moreover=4, buzzwords: comprehensive,solution,optimizes,systematically=12, formal=4, passive=2 → H=0, A=22 → 84)

"In conclusion, the synergistic implementation of innovative frameworks facilitates unprecedented optimization." → 91%
(transition: In conclusion=4, buzzwords: synergistic,implementation,innovative,frameworks,facilitates,unprecedented,optimization=21, formal=4 → 91)

"Consequently, it is imperative to leverage comprehensive strategies that facilitate robust, sustainable implementation paradigms." → 97%
(transition: Consequently=4, hedge: it is imperative=3, buzzwords=24, formal=4, passive=2 → 97)

## OUTPUT FORMAT
{
  "probability": [INTEGER 0-100],
  "calculation": {
    "humanSignals": [{"signal": "name", "count": N, "points": N}],
    "aiSignals": [{"signal": "name", "count": N, "points": N}],
    "totalH": N,
    "totalA": N,
    "rawScore": N,
    "adjustment": N,
    "finalScore": N
  },
  "classification": "Human-Written" if <=35 else "Hybrid" if <=64 else "AI-Generated",
  "aiPercentage": [SAME AS probability],
  "humanPercentage": [100 - probability],
  "confidenceLevel": "high" if <20 or >80 else "moderate" if <35 or >65 else "low",
  "sentenceAnalysis": [{"text": "first 40 chars...", "classification": "ai"|"human", "confidence": 0-100, "reason": "brief"}],
  "readabilityMetrics": {"fleschKincaidGrade": N, "fleschReadingEase": N, "gunningFogIndex": N, "avgWordsPerSentence": N, "avgSyllablesPerWord": N, "readabilityLevel": "easy"|"moderate"|"difficult"},
  "advancedMetrics": {"perplexityScore": N, "burstinessScore": N, "vocabularyRichness": N, "sentenceLengthVariance": N, "uniqueWordRatio": N},
  "evidenceSummary": {"linguisticMarkers": [], "structuralPatterns": [], "burstiessInsights": "", "anomalies": [], "aiSignatures": [], "humanSignatures": []},
  "detailedBreakdown": {"stylistic": {"score": N, "indicators": [], "weight": 0.2}, "semantic": {"score": N, "indicators": [], "weight": 0.2}, "statistical": {"score": N, "indicators": [], "weight": 0.2}, "errorPattern": {"score": N, "indicators": [], "weight": 0.15}, "toneFlow": {"score": N, "indicators": [], "weight": 0.15}},
  "writingStyle": {"formality": "formal"|"informal"|"mixed", "tone": "string", "complexity": "simple"|"moderate"|"complex", "vocabulary": "basic"|"intermediate"|"advanced"},
  "humanizationTips": [{"category": "style", "tip": "tip", "priority": "medium"}],
  "suggestions": [],
  "confidenceExplanation": "H=X from [signals], A=Y from [signals]. Raw=Z, Final=N%"
}

CRITICAL RULES:
- Count EVERY signal instance precisely
- Show ALL your math in calculation field
- The probability MUST be a single integer 0-100
- Analyze max 8 sentences
- Keep arrays to max 3 items
- Return ONLY valid JSON`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const truncatedText = text.length > 4000 ? text.substring(0, 4000) : text;
    const wordCount = truncatedText.split(/\s+/).length;

    console.log('Analyzing text, length:', truncatedText.length, 'words:', wordCount);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this text (${wordCount} words). Follow the EXACT calculation formula. Show your work. The probability can be ANY integer from 0 to 100.\n\nTEXT TO ANALYZE:\n${truncatedText}` }
        ],
        max_tokens: 4000,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze text. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('No content in response');
      return new Response(
        JSON.stringify({ error: 'No analysis received. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let analysisResult;
    try {
      let jsonContent = content.trim();
      
      if (jsonContent.includes('```json')) {
        jsonContent = jsonContent.split('```json')[1].split('```')[0];
      } else if (jsonContent.includes('```')) {
        jsonContent = jsonContent.split('```')[1].split('```')[0];
      }
      
      jsonContent = jsonContent.trim();
      
      const startIdx = jsonContent.indexOf('{');
      const endIdx = jsonContent.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonContent = jsonContent.substring(startIdx, endIdx + 1);
      }
      
      analysisResult = JSON.parse(jsonContent);
      
      // Validate and ensure probability is an integer 0-100
      if (typeof analysisResult.probability === 'number') {
        analysisResult.probability = Math.max(0, Math.min(100, Math.round(analysisResult.probability)));
      }
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      analysisResult = {
        classification: "Hybrid",
        probability: 50,
        confidenceLevel: "low",
        confidenceExplanation: "Analysis could not be fully completed."
      };
    }

    // Ensure probability is valid integer
    const probability = typeof analysisResult.probability === 'number' 
      ? Math.max(0, Math.min(100, Math.round(analysisResult.probability)))
      : 50;

    // Determine classification based on probability
    let classification: string;
    if (probability <= 35) {
      classification = 'Human-Written';
    } else if (probability <= 64) {
      classification = 'Hybrid';
    } else {
      classification = 'AI-Generated';
    }

    const result = {
      classification,
      probability,
      aiPercentage: probability,
      humanPercentage: 100 - probability,
      confidenceLevel: analysisResult.confidenceLevel || (probability < 20 || probability > 80 ? 'high' : probability < 35 || probability > 65 ? 'moderate' : 'low'),
      sentenceAnalysis: (analysisResult.sentenceAnalysis || []).slice(0, 8),
      readabilityMetrics: analysisResult.readabilityMetrics || {
        fleschKincaidGrade: 8, fleschReadingEase: 60, gunningFogIndex: 10,
        avgWordsPerSentence: 15, avgSyllablesPerWord: 1.5, readabilityLevel: 'moderate'
      },
      advancedMetrics: analysisResult.advancedMetrics || {
        perplexityScore: 50, burstinessScore: 50, vocabularyRichness: 50,
        sentenceLengthVariance: 50, uniqueWordRatio: 0.5
      },
      evidenceSummary: {
        linguisticMarkers: (analysisResult.evidenceSummary?.linguisticMarkers || []).slice(0, 3),
        structuralPatterns: (analysisResult.evidenceSummary?.structuralPatterns || []).slice(0, 3),
        burstiessInsights: analysisResult.evidenceSummary?.burstiessInsights || '',
        anomalies: (analysisResult.evidenceSummary?.anomalies || []).slice(0, 3),
        aiSignatures: (analysisResult.evidenceSummary?.aiSignatures || []).slice(0, 3),
        humanSignatures: (analysisResult.evidenceSummary?.humanSignatures || []).slice(0, 3)
      },
      detailedBreakdown: analysisResult.detailedBreakdown || {
        stylistic: { score: 50, indicators: [], weight: 0.2 },
        semantic: { score: 50, indicators: [], weight: 0.2 },
        statistical: { score: 50, indicators: [], weight: 0.2 },
        errorPattern: { score: 50, indicators: [], weight: 0.15 },
        toneFlow: { score: 50, indicators: [], weight: 0.15 }
      },
      writingStyle: analysisResult.writingStyle || {
        formality: 'mixed', tone: 'neutral', complexity: 'moderate', vocabulary: 'intermediate'
      },
      humanizationTips: (analysisResult.humanizationTips || []).slice(0, 3),
      suggestions: (analysisResult.suggestions || []).slice(0, 3),
      confidenceExplanation: analysisResult.confidenceExplanation || `Calculated probability: ${probability}%`,
      calculation: analysisResult.calculation || null
    };

    console.log('Analysis complete:', result.classification, 'Probability:', result.probability, 'Confidence:', result.confidenceLevel);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
