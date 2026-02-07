import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are an elite AI content detector. Return JSON only.

CRITICAL: EVERY NUMBER FROM 0-100 IS VALID
You can return: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100

NEVER DEFAULT TO COMMON VALUES. Pick the EXACT number that matches your analysis.

CLASSIFICATION RULES:
- Human-Written: probability 0-35%
- Hybrid: probability 36-64% (can be 36, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64 - NOT just 43 or 50!)
- AI-Generated: probability 65-100%

SIGNAL COUNTING:
Human signals: typos, slang (lol, ngl, fr, idk), contractions (don't, can't), incomplete sentences, emotional words, personal pronouns (I, my, we), specific names/details, humor, rhetorical questions, casual punctuation (!!, ..., ??)
AI signals: perfect grammar, formal transitions (Furthermore, Additionally, In conclusion, Moreover), generic statements, balanced sentence structure, buzzwords (innovative, comprehensive, leverage, optimize), passive voice, no contractions, academic tone

SCORING FORMULA - pick EXACT number:
- 9+ human signals, 0 AI = 0-5%
- 7-8 human, 1 AI = 6-15%
- 6 human, 2 AI = 16-25%
- 5 human, 3 AI = 26-35%
- 4 human, 4 AI = 36-50% (TRUE HYBRID - pick 36, 38, 41, 44, 47, 49, etc.)
- 3 human, 5 AI = 51-64% (LEANING AI HYBRID - pick 51, 54, 57, 59, 62, etc.)
- 2 human, 6 AI = 65-75%
- 1 human, 7+ AI = 76-89%
- 0 human, 8+ AI = 90-100%

HYBRID EXAMPLES (36-64% range):
- "The meeting went okay I guess, we discussed the quarterly objectives." = 42%
- "I really think this solution could work, though implementation requires careful planning." = 51%
- "Hey team, please review the comprehensive documentation attached." = 47%
- "Not gonna lie, the data analysis shows significant trends." = 39%
- "We should probably optimize our workflow going forward lol" = 44%
- "The results are promising but idk if we have enough resources." = 38%
- "Furthermore, I personally believe we need more coffee breaks." = 56%
- "This is pretty cool honestly, demonstrates unprecedented potential." = 53%

{
  "classification": "AI-Generated" | "Human-Written" | "Hybrid",
  "probability": [EXACT NUMBER 0-100 based on signal count],
  "aiPercentage": [SAME AS PROBABILITY],
  "humanPercentage": [100 MINUS PROBABILITY],
  "confidenceLevel": "high" | "moderate" | "low",
  "sentenceAnalysis": [{"text": "first 50 chars...", "classification": "ai"|"human", "confidence": 0-100, "reason": "brief", "signals": ["signal"]}],
  "readabilityMetrics": {"fleschKincaidGrade": 8, "fleschReadingEase": 60, "gunningFogIndex": 10, "avgWordsPerSentence": 15, "avgSyllablesPerWord": 1.5, "readabilityLevel": "moderate"},
  "advancedMetrics": {"perplexityScore": 50, "burstinessScore": 50, "vocabularyRichness": 50, "sentenceLengthVariance": 50, "uniqueWordRatio": 0.5},
  "evidenceSummary": {"linguisticMarkers": [], "structuralPatterns": [], "burstiessInsights": "", "anomalies": [], "aiSignatures": [], "humanSignatures": []},
  "detailedBreakdown": {
    "stylistic": {"score": 50, "indicators": [], "weight": 0.2},
    "semantic": {"score": 50, "indicators": [], "weight": 0.2},
    "statistical": {"score": 50, "indicators": [], "weight": 0.2},
    "errorPattern": {"score": 50, "indicators": [], "weight": 0.15},
    "toneFlow": {"score": 50, "indicators": [], "weight": 0.15}
  },
  "writingStyle": {"formality": "formal", "tone": "neutral", "complexity": "moderate", "vocabulary": "intermediate"},
  "humanizationTips": [{"category": "style", "tip": "tip", "priority": "medium"}],
  "suggestions": [],
  "confidenceExplanation": "Found X human signals and Y AI signals = Z%"
}

RULES:
- Analyze first 8 sentences max
- Keep sentenceAnalysis text to 50 chars max
- Max 3 items per array
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

    // Limit text more aggressively
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
          { role: 'user', content: `Analyze this text (${wordCount} words). Pick a UNIQUE probability from 0-100 based on signals. Return ONLY valid JSON:\n\n${truncatedText}` }
        ],
        max_tokens: 4000,
        temperature: 0.7
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
      // Clean up content - remove markdown, find JSON
      let jsonContent = content.trim();
      
      // Remove markdown code blocks
      if (jsonContent.includes('```json')) {
        jsonContent = jsonContent.split('```json')[1].split('```')[0];
      } else if (jsonContent.includes('```')) {
        jsonContent = jsonContent.split('```')[1].split('```')[0];
      }
      
      jsonContent = jsonContent.trim();
      
      // Try to find the JSON object boundaries
      const startIdx = jsonContent.indexOf('{');
      const endIdx = jsonContent.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonContent = jsonContent.substring(startIdx, endIdx + 1);
      }
      
      analysisResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content length:', content.length);
      
      // Return a fallback result instead of error
      analysisResult = {
        classification: "Hybrid",
        probability: 50,
        confidenceLevel: "low",
        confidenceExplanation: "Analysis could not be fully completed. Please try with shorter text."
      };
    }

    // Build result with defaults
    const result = {
      classification: analysisResult.classification || 'Hybrid',
      probability: analysisResult.probability ?? 50,
      aiPercentage: analysisResult.aiPercentage ?? analysisResult.probability ?? 50,
      humanPercentage: analysisResult.humanPercentage ?? (100 - (analysisResult.probability ?? 50)),
      confidenceLevel: analysisResult.confidenceLevel || 'moderate',
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
      confidenceExplanation: analysisResult.confidenceExplanation || 'Analysis completed.'
    };

    console.log('Analysis complete:', result.classification, 'Confidence:', result.confidenceLevel);

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
