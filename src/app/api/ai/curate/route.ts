import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { prompt, type } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Determine which AI provider to use
    let aiResponse;
    
    if (GEMINI_API_KEY) {
      aiResponse = await callGemini(prompt, type)
    } else if (OPENROUTER_API_KEY) {
      aiResponse = await callOpenRouter(prompt, type)
    } else {
      return NextResponse.json({ 
        error: 'AI keys missing', 
        details: 'Please add GEMINI_API_KEY or OPENROUTER_API_KEY to your environment.' 
      }, { status: 503 })
    }

    return NextResponse.json({ result: aiResponse })

  } catch (err) {
    console.error('AI Curation Error:', err)
    return NextResponse.json({ error: 'Failed to generate curation' }, { status: 500 })
  }
}

async function callGemini(prompt: string, type: string) {
  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  const systemInstruction = `
    You are Evorca Prestige AI, an elite event curator. 
    Based on the user's description, generate a structured JSON response for an event.
    The response MUST be valid JSON with these keys: 
    "title" (elegant title), 
    "description" (editorial narrative), 
    "suggested_price" (number), 
    "currency" (e.g. KES),
    "dress_code" (style guide),
    "tiers" (array of suggested ticket levels).
    Maintain a high-end, prestigious tone.
  `;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemInstruction}\n\nUser Prompt: ${prompt}` }]
      }]
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Basic JSON extraction from markdown if AI returns it
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
}

async function callOpenRouter(prompt: string, type: string) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://evorca.com',
      'X-Title': 'Evorca Prestige',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5',
      messages: [
        { role: 'system', content: 'You are an elite event curator. Return only valid JSON for event details.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
}
