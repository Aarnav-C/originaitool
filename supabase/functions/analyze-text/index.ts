import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are an AI content detector. Return ONLY valid JSON with an integer 0-100.

## ALL 101 POSSIBLE OUTPUTS
Your output MUST be exactly one of: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100

## PERCENTAGE RANGES - WHEN TO USE EACH

### 0-5%: EXTREMELY HUMAN (heavy slang, typos, texting style)
- Multiple slang terms (lol, omg, wtf, ngl, fr, bruh, lmao)
- Missing apostrophes (cant, dont, im, wont)
- Excessive punctuation (!!, ??, ...)
- Stream of consciousness, fragments
Examples: 0%="bruh wtf lmaooo i cant even rn 😭😭", 3%="omg wait no i forgot lol my bad!!", 5%="yeah so like idk maybe we could try that thing?"

### 6-15%: VERY HUMAN (casual conversation, some slang)
- Some slang or informal language
- Personal pronouns heavily used
- Contractions, casual tone
Examples: 7%="haha yeah that sounds good to me tbh", 11%="I was gonna say the same thing honestly", 14%="so I went to the store and forgot my wallet lol"

### 16-25%: MOSTLY HUMAN (everyday writing, personal)
- Natural flow with personal touches
- Some specific details (names, places, dates)
- Conversational but mostly proper grammar
Examples: 17%="My sister Sarah came over yesterday and we watched movies", 21%="I really enjoyed that book, the ending surprised me", 24%="The coffee at that new place downtown is actually pretty good"

### 26-35%: LEAN HUMAN (polished casual, blogs, emails)
- Clear human voice but polished
- Mix of personal and general statements
- Few if any AI markers
Examples: 28%="I've been thinking about switching jobs lately. The commute is killing me.", 32%="We had a great time at the conference. Met some interesting people.", 35%="The project went well overall, though we hit a few bumps along the way."

### 36-45%: SLIGHT HUMAN LEAN (professional casual)
- Professional but still personal
- Some formal words creeping in
- Balanced structure
Examples: 37%="The team has been working hard on this initiative. I think we're close.", 41%="This approach could work, but we should consider the alternatives first.", 44%="Looking at the data, there seem to be some interesting patterns emerging."

### 46-55%: TRUE HYBRID (mixed signals, uncertain)
- Equal human and AI markers
- Could go either way
- Edited AI or formal human writing
Examples: 47%="The analysis reveals several key insights that warrant further investigation.", 50%="We need to optimize our approach while maintaining flexibility for changes.", 53%="The implementation process requires careful consideration of multiple factors."

### 56-65%: SLIGHT AI LEAN (formal professional)
- More formal tone dominates
- Some buzzwords appearing
- Structured but not robotic
Examples: 57%="This solution addresses the core requirements while providing scalability.", 61%="The framework enables teams to collaborate more effectively across departments.", 64%="Our methodology ensures consistent results through standardized processes."

### 66-75%: LEAN AI (corporate, documentation)
- Clear formal/corporate tone
- Multiple buzzwords present
- Perfect grammar, no contractions
Examples: 67%="The strategic initiative leverages existing resources to maximize efficiency.", 71%="This comprehensive approach facilitates improved outcomes across all metrics.", 74%="The implementation framework provides robust capabilities for enterprise needs."

### 76-85%: MOSTLY AI (heavy corporate speak)
- Buzzword-heavy
- Formal transitions (Furthermore, Additionally)
- Academic or corporate tone throughout
Examples: 77%="Furthermore, this innovative solution enables unprecedented operational efficiency.", 81%="The comprehensive framework facilitates optimal resource utilization strategies.", 84%="Additionally, our robust methodology ensures sustainable competitive advantages."

### 86-95%: VERY AI (dense corporate/academic)
- Buzzword stacking
- Multiple formal transitions
- Zero human markers
Examples: 87%="Moreover, the synergistic implementation optimizes cross-functional collaboration paradigms.", 91%="Consequently, this transformative approach leverages cutting-edge methodologies systematically.", 94%="In conclusion, the unprecedented optimization facilitates comprehensive strategic alignment."

### 96-100%: EXTREMELY AI (maximum corporate density)
- Maximum buzzword saturation
- Every sentence has AI markers
- Completely robotic flow
Examples: 97%="Furthermore, it is imperative to leverage robust synergistic frameworks that facilitate unprecedented optimization.", 99%="Consequently, the comprehensive implementation of innovative paradigm-shifting methodologies enables transformative strategic realignment.", 100%="Moreover, the synergistic convergence of unprecedented optimization frameworks facilitates comprehensive stakeholder-centric value proposition enhancement."

## SIGNAL COUNTING

HUMAN SIGNALS (each occurrence subtracts points):
- Slang (lol,omg,wtf,ngl,fr,idk,gonna,wanna,kinda,tbh,bruh,lmao): -4 pts each
- Typos/missing apostrophes (cant,dont,im,wont,youre): -3 pts each  
- Contractions (don't,can't,won't,I'm,we're,they're): -2 pts each
- Personal pronouns (I,my,me,we,our,you): -1 pt each
- Emotion words (love,hate,amazing,awesome,terrible): -2 pts each
- Specific names/places/dates: -2 pts each
- Casual punctuation (!!,??,--,...): -3 pts each
- Interjections (oh,ah,um,well,yeah,haha): -2 pts each
- Self-corrections (I mean,wait,actually,well): -4 pts each
- Fragments/incomplete sentences: -3 pts each

AI SIGNALS (each occurrence adds points):
- Formal transitions (Furthermore,Additionally,Moreover,Consequently,Therefore): +4 pts each
- Buzzwords (comprehensive,innovative,leverage,optimize,facilitate,robust,synergy,unprecedented,strategic,paradigm,stakeholder,implementation,framework,methodology): +3 pts each
- Perfect grammar throughout: +5 pts
- Zero contractions (in 50+ word text): +3 pts
- Passive voice sentences: +2 pts each
- Hedging (It is important,One might argue,It should be noted): +3 pts each
- Academic/formal tone: +4 pts
- Generic statements: +2 pts each

## FORMULA
score = 50 + (AI_points) - (Human_points)
final = clamp(score, 0, 100) + ((word_count % 7) - 3)
final = clamp(final, 0, 100)

## OUTPUT FORMAT
{
  "probability": [INTEGER 0-100],
  "calculation": {"humanSignals": [{"signal":"x","count":N,"points":N}], "aiSignals": [{"signal":"x","count":N,"points":N}], "totalH": N, "totalA": N, "rawScore": N, "adjustment": N, "finalScore": N},
  "classification": "Human-Written" if <=35 else "Hybrid" if <=64 else "AI-Generated",
  "aiPercentage": [SAME AS probability],
  "humanPercentage": [100 - probability],
  "confidenceLevel": "high" if <20 or >80 else "moderate" if <35 or >65 else "low",
  "sentenceAnalysis": [{"text": "40chars...", "classification": "ai"|"human", "confidence": N, "reason": "brief"}],
  "readabilityMetrics": {"fleschKincaidGrade": N, "fleschReadingEase": N, "gunningFogIndex": N, "avgWordsPerSentence": N, "avgSyllablesPerWord": N, "readabilityLevel": "easy"|"moderate"|"difficult"},
  "advancedMetrics": {"perplexityScore": N, "burstinessScore": N, "vocabularyRichness": N, "sentenceLengthVariance": N, "uniqueWordRatio": N},
  "evidenceSummary": {"linguisticMarkers": [], "structuralPatterns": [], "burstiessInsights": "", "anomalies": [], "aiSignatures": [], "humanSignatures": []},
  "detailedBreakdown": {"stylistic": {"score": N, "indicators": [], "weight": 0.2}, "semantic": {"score": N, "indicators": [], "weight": 0.2}, "statistical": {"score": N, "indicators": [], "weight": 0.2}, "errorPattern": {"score": N, "indicators": [], "weight": 0.15}, "toneFlow": {"score": N, "indicators": [], "weight": 0.15}},
  "writingStyle": {"formality": "formal"|"informal"|"mixed", "tone": "string", "complexity": "simple"|"moderate"|"complex", "vocabulary": "basic"|"intermediate"|"advanced"},
  "humanizationTips": [{"category": "style", "tip": "tip", "priority": "medium"}],
  "suggestions": [],
  "confidenceExplanation": "H=X from [signals], A=Y from [signals]. Score=Z%"
}

RULES: Count every signal. Show math. Integer 0-100 only. Max 8 sentences. Max 3 array items. JSON only.`;

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
