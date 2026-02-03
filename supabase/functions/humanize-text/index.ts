import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const getSystemPrompt = (style: string) => {
  const basePrompt = `You are an expert editor who transforms AI-generated text into natural, human-sounding writing. Your job is to rewrite the provided text while:

1. PRESERVING the original meaning and key information
2. ADDING natural human touches like:
   - Varied sentence structures and lengths
   - Occasional informal expressions or contractions
   - Personal touches and subtle opinions
   - Minor imperfections that feel authentic
   - Conversational transitions
3. REMOVING AI tells like:
   - Overly formal or stiff language
   - Repetitive sentence patterns
   - Generic filler phrases
   - Robotic transitions like "Furthermore" or "Additionally"
   - Perfect parallel structures

STYLE: ${style === 'casual' ? 'Write in a relaxed, conversational tone like chatting with a friend.' : 
         style === 'professional' ? 'Maintain professionalism but add warmth and personality.' :
         'Write naturally, as a thoughtful human would.'}

OUTPUT: Return ONLY the rewritten text. No explanations, no quotes, just the humanized text.`;

  return basePrompt;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, style = 'natural' } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Humanizing text, length:', text.length, 'style:', style);

    // Truncate if too long
    const truncatedText = text.length > 5000 ? text.substring(0, 5000) + '...' : text;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: getSystemPrompt(style) },
          { role: 'user', content: `Rewrite this text to sound more human:\n\n${truncatedText}` }
        ],
        max_tokens: 2000
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
      
      return new Response(
        JSON.stringify({ error: 'Failed to humanize text. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const humanizedText = data.choices[0]?.message?.content?.trim();

    if (!humanizedText) {
      return new Response(
        JSON.stringify({ error: 'No response received. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Text humanized successfully');

    return new Response(
      JSON.stringify({ humanizedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in humanize-text function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
