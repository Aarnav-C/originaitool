import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scanning URL:', url);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch URL: ${response.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    // Extract text content from HTML using regex patterns
    const scriptPattern = new RegExp('<script[^>]*>[\\s\\S]*?</script>', 'gi');
    const stylePattern = new RegExp('<style[^>]*>[\\s\\S]*?</style>', 'gi');
    const navPattern = new RegExp('<nav[^>]*>[\\s\\S]*?</nav>', 'gi');
    const headerPattern = new RegExp('<header[^>]*>[\\s\\S]*?</header>', 'gi');
    const footerPattern = new RegExp('<footer[^>]*>[\\s\\S]*?</footer>', 'gi');
    const asidePattern = new RegExp('<aside[^>]*>[\\s\\S]*?</aside>', 'gi');
    const tagPattern = new RegExp('<[^>]+>', 'g');

    // Remove unwanted elements
    let text = html
      .replace(scriptPattern, '')
      .replace(stylePattern, '')
      .replace(navPattern, '')
      .replace(headerPattern, '')
      .replace(footerPattern, '')
      .replace(asidePattern, '');

    // Remove HTML tags but keep content
    text = text.replace(tagPattern, ' ');
    
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-z]+;/gi, ' ');

    // Clean up whitespace
    text = text
      .replace(/\s+/g, ' ')
      .trim();

    // Limit text length
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '...';
    }

    console.log('Extracted text length:', text.length);

    return new Response(
      JSON.stringify({ text, url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scanning URL:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to scan URL. Please check the URL and try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
