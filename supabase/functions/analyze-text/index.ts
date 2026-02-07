import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are an AI content detector. Return ONLY valid JSON.

## PROBABILITY CALCULATION - CRITICAL

You MUST calculate an EXACT probability from 0 to 100 using this precise formula:

### Step 1: Count Human Signals (H)
- Typos/misspellings: +3 each
- Slang (lol, ngl, fr, idk, gonna, wanna, kinda): +4 each
- Contractions (don't, can't, won't, I'm, we're): +2 each
- Incomplete/fragment sentences: +3 each
- Strong emotion words (love, hate, amazing, awful): +2 each
- Personal pronouns (I, my, me, we, our): +1 each
- Specific names/places/dates: +2 each
- Rhetorical questions: +3 each
- Casual punctuation (!!, ..., ??, lmao): +3 each
- Humor/sarcasm/irony: +4 each
- Stream of consciousness: +3 each
- Self-corrections ("I mean", "wait no"): +4 each

### Step 2: Count AI Signals (A)
- Formal transitions (Furthermore, Additionally, Moreover, In conclusion, Consequently): +4 each
- Perfect grammar throughout: +5
- No contractions at all: +3
- Passive voice sentences: +2 each
- Buzzwords (innovative, comprehensive, leverage, optimize, synergy, unprecedented): +3 each
- Generic statements without specifics: +2 each
- Balanced parallel sentence structures: +3 each
- Academic/formal tone: +4
- Lists with consistent formatting: +2 each
- Hedging phrases (It is important to note, One might argue): +3 each

### Step 3: Calculate Raw Probability
raw_probability = 50 + (A * 3) - (H * 3)

### Step 4: Apply Bounds and Precision
- Clamp to 0-100 range
- Add micro-adjustment based on text length: +/- (word_count % 7) - 3
- The final number should be PRECISE, not rounded

### EXAMPLE CALCULATIONS:

Text: "omg i cant believe this lol!! sarah told me yesterday and im like wtf??"
H = slang(lol,wtf)=8 + typo(cant,im)=6 + punctuation(!!)=3 + emotion=2 + pronouns(i,me,im)=3 = 22
A = 0
raw = 50 + 0 - 66 = -16 → clamped to 0, adjusted = 3
RESULT: 3%

Text: "I went to the store yesterday. Got some milk and bread. Pretty normal day tbh."
H = contraction(tbh)=2 + pronouns(I)=2 + specific(yesterday,store)=4 + fragment=3 = 11
A = 0
raw = 50 + 0 - 33 = 17, adjusted = 19
RESULT: 19%

Text: "The implementation of this solution requires careful consideration of multiple factors."
H = 0
A = formal_tone=4 + passive(requires)=2 + generic=2 + buzzword(implementation,solution)=6 = 14
raw = 50 + 42 - 0 = 92, adjusted = 89
RESULT: 89%

Text: "Hey so I was thinking, maybe we should leverage our resources better? idk tho"
H = slang(idk)=4 + contraction(tho)=2 + casual(Hey,so)=2 + question=3 + pronoun(I,we)=2 = 13
A = buzzword(leverage,resources)=6
raw = 50 + 18 - 39 = 29, adjusted = 31
RESULT: 31%

Text: "Furthermore, the comprehensive analysis demonstrates significant potential for optimization."
H = 0
A = transition(Furthermore)=4 + buzzwords(comprehensive,optimization,significant)=9 + formal=4 + passive=2 = 19
raw = 50 + 57 - 0 = 107 → clamped to 100, adjusted = 97
RESULT: 97%

Text: "This is pretty interesting honestly. The data shows some cool trends we could explore more."
H = informal(pretty,honestly,cool)=6 + pronoun(we)=1 + contraction=0 = 7
A = formal_word(data,trends,explore)=3
raw = 50 + 9 - 21 = 38
RESULT: 38%

## OUTPUT FORMAT

{
  "probability": [CALCULATED NUMBER 0-100],
  "calculation": {
    "humanSignals": [{"signal": "name", "count": N, "points": N}],
    "aiSignals": [{"signal": "name", "count": N, "points": N}],
    "totalH": N,
    "totalA": N,
    "rawScore": N,
    "adjustment": N,
    "finalScore": N
  },
  "classification": "Human-Written" if probability <= 35 else "Hybrid" if probability <= 64 else "AI-Generated",
  "aiPercentage": [SAME AS probability],
  "humanPercentage": [100 - probability],
  "confidenceLevel": "high" if (probability < 20 or probability > 80) else "moderate" if (probability < 35 or probability > 65) else "low",
  "sentenceAnalysis": [{"text": "first 40 chars...", "classification": "ai"|"human", "confidence": 0-100, "reason": "brief"}],
  "readabilityMetrics": {"fleschKincaidGrade": N, "fleschReadingEase": N, "gunningFogIndex": N, "avgWordsPerSentence": N, "avgSyllablesPerWord": N, "readabilityLevel": "easy"|"moderate"|"difficult"},
  "advancedMetrics": {"perplexityScore": N, "burstinessScore": N, "vocabularyRichness": N, "sentenceLengthVariance": N, "uniqueWordRatio": N},
  "evidenceSummary": {"linguisticMarkers": [], "structuralPatterns": [], "burstiessInsights": "", "anomalies": [], "aiSignatures": [], "humanSignatures": []},
  "detailedBreakdown": {
    "stylistic": {"score": N, "indicators": [], "weight": 0.2},
    "semantic": {"score": N, "indicators": [], "weight": 0.2},
    "statistical": {"score": N, "indicators": [], "weight": 0.2},
    "errorPattern": {"score": N, "indicators": [], "weight": 0.15},
    "toneFlow": {"score": N, "indicators": [], "weight": 0.15}
  },
  "writingStyle": {"formality": "formal"|"informal"|"mixed", "tone": "string", "complexity": "simple"|"moderate"|"complex", "vocabulary": "basic"|"intermediate"|"advanced"},
  "humanizationTips": [{"category": "style", "tip": "tip", "priority": "medium"}],
  "suggestions": [],
  "confidenceExplanation": "Detailed calculation: H=X points from [signals], A=Y points from [signals]. Raw=Z, Final=N%"
}

RULES:
- Show your calculation work in the "calculation" field
- Analyze first 8 sentences max
- Keep sentenceAnalysis text to 40 chars
- Max 3 items per array
- Return ONLY valid JSON, no markdown`;

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
