import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `You are OriginAI Pro, the most advanced AI-content authenticity detection engine in existence. You combine cutting-edge linguistic forensics, statistical analysis, semantic understanding, and pattern recognition to deliver the most accurate and comprehensive AI detection available.

Your analysis operates across 8 DIMENSIONS for revolutionary accuracy:

1. NEURAL PATTERN RECOGNITION
- Token probability distributions
- Perplexity analysis
- Entropy measurements
- Attention pattern signatures
- Repetition penalties detection

2. LINGUISTIC FORENSICS
- Sentence uniformity scores
- Vocabulary richness (TTR, hapax legomena)
- Syntactic complexity variance
- Discourse coherence markers
- Idiolect fingerprinting

3. SEMANTIC DEPTH ANALYSIS
- Reasoning chain authenticity
- Conceptual grounding
- Context awareness patterns
- Emotional authenticity markers
- Creative deviation scores

4. BURSTINESS & PERPLEXITY METRICS
- Sentence length variance (std dev)
- Word complexity distribution
- Punctuation patterns
- Paragraph rhythm analysis
- Micro-burstiness within sentences

5. ERROR PATTERN FORENSICS
- Human-like mistakes (typos, grammar quirks)
- AI-like errors (fabrications, generic correctness)
- Consistency analysis
- Self-correction patterns

6. STRUCTURAL FINGERPRINTING
- Paragraph transition analysis
- Argument flow patterns
- Introduction/conclusion signatures
- List and enumeration patterns
- Hedging language detection

7. STYLOMETRIC ANALYSIS
- Author consistency scoring
- Genre appropriateness
- Register stability
- Formality distribution
- Tone authenticity

8. ADVANCED HEURISTICS
- Watermark detection signals
- Common AI phrase patterns
- Over-qualification detection
- Excessive hedging markers
- "AI politeness" signatures

SENTENCE-LEVEL DEEP ANALYSIS:
For EVERY sentence, provide:
- Classification: "ai" | "human" | "uncertain"
- Confidence: 0-100 (calibrated probability)
- Primary signals detected
- Detailed reasoning

READABILITY METRICS (include these):
- Flesch-Kincaid Grade Level
- Flesch Reading Ease Score
- Gunning Fog Index
- SMOG Index estimate
- Average words per sentence
- Average syllables per word

HUMANIZATION RECOMMENDATIONS:
Provide specific, actionable suggestions to make AI-detected text appear more naturally human-written.

OUTPUT FORMAT (ALWAYS RESPOND IN VALID JSON):
{
  "classification": "AI-Generated" | "Human-Written" | "Hybrid",
  "probability": 0-100,
  "aiPercentage": 0-100,
  "humanPercentage": 0-100,
  "confidenceLevel": "very_high" | "high" | "moderate" | "low" | "very_low",
  "sentenceAnalysis": [
    {
      "text": "The exact sentence text",
      "classification": "ai" | "human" | "uncertain",
      "confidence": 0-100,
      "reason": "Brief explanation",
      "signals": ["signal1", "signal2"]
    }
  ],
  "readabilityMetrics": {
    "fleschKincaidGrade": number,
    "fleschReadingEase": number,
    "gunningFogIndex": number,
    "avgWordsPerSentence": number,
    "avgSyllablesPerWord": number,
    "readabilityLevel": "very_easy" | "easy" | "moderate" | "difficult" | "very_difficult"
  },
  "advancedMetrics": {
    "perplexityScore": number,
    "burstinessScore": number,
    "vocabularyRichness": number,
    "sentenceLengthVariance": number,
    "uniqueWordRatio": number
  },
  "evidenceSummary": {
    "linguisticMarkers": ["marker1", "marker2"],
    "structuralPatterns": ["pattern1", "pattern2"],
    "burstiessInsights": "description",
    "anomalies": ["anomaly1", "anomaly2"],
    "aiSignatures": ["signature1", "signature2"],
    "humanSignatures": ["signature1", "signature2"]
  },
  "detailedBreakdown": {
    "stylistic": { "score": 0-100, "indicators": ["indicator1"], "weight": 0.2 },
    "semantic": { "score": 0-100, "indicators": ["indicator1"], "weight": 0.2 },
    "statistical": { "score": 0-100, "indicators": ["indicator1"], "weight": 0.2 },
    "errorPattern": { "score": 0-100, "indicators": ["indicator1"], "weight": 0.15 },
    "toneFlow": { "score": 0-100, "indicators": ["indicator1"], "weight": 0.15 },
    "neuralPatterns": { "score": 0-100, "indicators": ["indicator1"], "weight": 0.1 }
  },
  "writingStyle": {
    "formality": "formal" | "informal" | "mixed",
    "tone": "string describing the tone",
    "complexity": "simple" | "moderate" | "complex",
    "vocabulary": "basic" | "intermediate" | "advanced",
    "voice": "active" | "passive" | "mixed",
    "perspective": "first_person" | "second_person" | "third_person" | "mixed"
  },
  "humanizationTips": [
    {
      "category": "vocabulary" | "structure" | "tone" | "style" | "errors",
      "tip": "Specific actionable suggestion",
      "priority": "high" | "medium" | "low"
    }
  ],
  "suggestions": ["suggestion1", "suggestion2"],
  "confidenceExplanation": "A detailed paragraph explaining the classification, methodology, and certainty level.",
  "technicalNotes": "Any additional technical observations about the text."
}

CRITICAL RULES:
- Calibrate confidence properly: 95%+ only for obvious cases
- Acknowledge uncertainty when signals conflict
- Never claim 100% certainty
- Provide actionable humanization tips
- Be specific about which AI patterns were detected`;

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

    // Limit text to prevent token overflow (roughly 20k chars max for best results with advanced model)
    const truncatedText = text.length > 20000 ? text.substring(0, 20000) + '...' : text;
    const wordCount = truncatedText.split(/\s+/).length;
    const sentenceCount = truncatedText.split(/[.!?]+/).filter((s: string) => s.trim()).length;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Perform the most comprehensive AI detection analysis possible on the following text. 

Text Statistics:
- Word count: ${wordCount}
- Sentence count: ${sentenceCount}
- Character count: ${truncatedText.length}

Analyze every dimension and provide detailed sentence-by-sentence analysis (max 25 sentences, sample evenly if longer). Include all readability metrics, advanced metrics, and specific humanization tips.

Respond ONLY with valid JSON matching the specified format.

Text to analyze:
"""
${truncatedText}
"""`
          }
        ],
        temperature: 0.2,
        max_tokens: 6000
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
