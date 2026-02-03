import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are an AI content detector. Analyze text and determine if it was written by AI or a human.

OUTPUT FORMAT (JSON only):
{
  "classification": "AI-Generated" | "Human-Written" | "Hybrid",
  "probability": 0-100,
  "aiPercentage": 0-100,
  "humanPercentage": 0-100,
  "confidenceLevel": "very_high" | "high" | "moderate" | "low",
  "sentenceAnalysis": [{"text": "sentence", "classification": "ai"|"human"|"uncertain", "confidence": 0-100, "reason": "brief reason", "signals": ["signal"]}],
  "readabilityMetrics": {"fleschKincaidGrade": 8, "fleschReadingEase": 60, "gunningFogIndex": 10, "avgWordsPerSentence": 15, "avgSyllablesPerWord": 1.5, "readabilityLevel": "moderate"},
  "advancedMetrics": {"perplexityScore": 50, "burstinessScore": 50, "vocabularyRichness": 50, "sentenceLengthVariance": 50, "uniqueWordRatio": 0.5},
  "evidenceSummary": {"linguisticMarkers": [], "structuralPatterns": [], "burstiessInsights": "", "anomalies": [], "aiSignatures": [], "humanSignatures": []},
  "detailedBreakdown": {
    "stylistic": {"score": 50, "indicators": [], "weight": 0.2},
    "semantic": {"score": 50, "indicators": [], "weight": 0.2},
    "statistical": {"score": 50, "indicators": [], "weight": 0.2},
    "errorPattern": {"score": 50, "indicators": [], "weight": 0.15},
    "toneFlow": {"score": 50, "indicators": [], "weight": 0.15},
    "neuralPatterns": {"score": 50, "indicators": [], "weight": 0.1}
  },
  "writingStyle": {"formality": "formal"|"informal"|"mixed", "tone": "neutral", "complexity": "moderate", "vocabulary": "intermediate", "voice": "mixed", "perspective": "mixed"},
  "humanizationTips": [{"category": "style", "tip": "suggestion", "priority": "medium"}],
  "suggestions": [],
  "confidenceExplanation": "Brief explanation",
  "technicalNotes": ""
}

RULES:
- Respond ONLY with valid JSON
- Analyze max 15 sentences
- Be concise in explanations`;

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

    console.log('OriginAI Pro: Analyzing text of length:', text.length);

    // Limit text to prevent token overflow - keep it shorter for reliability
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) + '...' : text;
    const wordCount = truncatedText.split(/\s+/).length;
    const sentenceCount = truncatedText.split(/[.!?]+/).filter((s: string) => s.trim()).length;

    console.log('OriginAI Pro: Analyzing text of length:', text.length, 'words:', wordCount);

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
          { 
            role: 'user', 
            content: `Analyze for AI detection (${wordCount} words, ${sentenceCount} sentences). JSON only:\n\n${truncatedText}`
          }
        ],
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      console.error('No content in Lovable AI response');
      return new Response(
        JSON.stringify({ error: 'No analysis received. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let analysisResult;
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0];
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0];
      }
      analysisResult = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError, 'Content preview:', content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Analysis response was incomplete. Please try with shorter text.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure all expected fields exist with defaults
    const result = {
      classification: analysisResult.classification || 'Hybrid',
      probability: analysisResult.probability || 50,
      aiPercentage: analysisResult.aiPercentage || analysisResult.probability || 50,
      humanPercentage: analysisResult.humanPercentage || (100 - (analysisResult.probability || 50)),
      confidenceLevel: analysisResult.confidenceLevel || 'moderate',
      sentenceAnalysis: analysisResult.sentenceAnalysis || [],
      readabilityMetrics: analysisResult.readabilityMetrics || {
        fleschKincaidGrade: 0,
        fleschReadingEase: 0,
        gunningFogIndex: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
        readabilityLevel: 'moderate'
      },
      advancedMetrics: analysisResult.advancedMetrics || {
        perplexityScore: 0,
        burstinessScore: 0,
        vocabularyRichness: 0,
        sentenceLengthVariance: 0,
        uniqueWordRatio: 0
      },
      evidenceSummary: analysisResult.evidenceSummary || {
        linguisticMarkers: [],
        structuralPatterns: [],
        burstiessInsights: '',
        anomalies: [],
        aiSignatures: [],
        humanSignatures: []
      },
      detailedBreakdown: analysisResult.detailedBreakdown || {
        stylistic: { score: 50, indicators: [], weight: 0.2 },
        semantic: { score: 50, indicators: [], weight: 0.2 },
        statistical: { score: 50, indicators: [], weight: 0.2 },
        errorPattern: { score: 50, indicators: [], weight: 0.15 },
        toneFlow: { score: 50, indicators: [], weight: 0.15 },
        neuralPatterns: { score: 50, indicators: [], weight: 0.1 }
      },
      writingStyle: analysisResult.writingStyle || {
        formality: 'mixed',
        tone: 'neutral',
        complexity: 'moderate',
        vocabulary: 'intermediate',
        voice: 'mixed',
        perspective: 'mixed'
      },
      humanizationTips: analysisResult.humanizationTips || [],
      suggestions: analysisResult.suggestions || [],
      confidenceExplanation: analysisResult.confidenceExplanation || 'Analysis completed.',
      technicalNotes: analysisResult.technicalNotes || ''
    };

    console.log('OriginAI Pro: Analysis complete:', result.classification, 'Confidence:', result.confidenceLevel);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-text function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
