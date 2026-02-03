import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are an AI detector. Analyze text and return JSON.

CRITICAL: Return ONLY valid JSON, no markdown, no extra text. Keep responses SHORT.

{
  "classification": "AI-Generated" | "Human-Written" | "Hybrid",
  "probability": 0-100,
  "aiPercentage": 0-100,
  "humanPercentage": 0-100,
  "confidenceLevel": "high" | "moderate" | "low",
  "sentenceAnalysis": [{"text": "first 50 chars...", "classification": "ai"|"human", "confidence": 80, "reason": "brief", "signals": ["signal"]}],
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
  "confidenceExplanation": "Brief explanation"
}

RULES:
- ONLY analyze first 8 sentences max
- Keep sentenceAnalysis text to 50 chars max (truncate with ...)
- Keep all string values SHORT
- Max 3 items per array
- Return ONLY the JSON object, nothing else`;

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
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this text (${wordCount} words). Return ONLY valid JSON:\n\n${truncatedText}` }
        ],
        max_tokens: 2000,
        temperature: 0.3
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
