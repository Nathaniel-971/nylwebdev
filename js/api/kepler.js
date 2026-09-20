/* Kepler — AI UI template generator
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */

const SYSTEM_PROMPT = `You are Kepler, a UI template generator for Nyl Web Dev — a studio that builds websites AND apps.

The user will describe what they want to build. Return ONLY valid JSON. No markdown. No explanation. No code fences.

Output schema (exact keys, exact order):
{
  "name": "Short brand name",
  "tagline": "One line describing the brand",
  "type": "website" or "app",
  "industry": "e.g. restaurant, law firm, fitness, social, e-commerce",
  "colors": {
    "background": "#hex6",
    "surface": "#hex6",
    "primary": "#hex6",
    "secondary": "#hex6",
    "accent": "#hex6",
    "text": "#hex6",
    "muted": "#hex6"
  },
  "fonts": {
    "heading": "serif" or "sans" or "mono",
    "body": "serif" or "sans" or "mono"
  },
  "layout": "minimal" or "luxury" or "bold" or "playful" or "corporate",
  "sections": ["hero", "services", "about", "contact", "gallery", "pricing", "blog", "testimonials"],
  "notes": "One sentence explaining the design direction"
}

Rules:
- Every colour must be a valid 6-digit hex code starting with #
- Choose a palette that fits the industry and mood described
- Background must be light or dark and text must contrast against it
- "type" must be "website" or "app" — apps use different sections like "feed", "profile", "settings"
- "layout" must be exactly one of: minimal, luxury, bold, playful, corporate
- Output ONLY the JSON object. Any extra text breaks the parser.`;

async function callDeepSeek(prompt) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('no deepseek key');

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error('deepseek ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('no gemini key');

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) throw new Error('gemini ' + res.status);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('no openrouter key');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://nylwebdev.vercel.app',
      'X-Title': 'Kepler',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash',
      models: [
        'deepseek/deepseek-v4-flash',
        'google/gemini-2.5-flash',
        'anthropic/claude-3.5-haiku',
      ],
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error('openrouter ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON(raw) {
  if (!raw) throw new Error('empty response');
  let text = String(raw).trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('no json');
  return JSON.parse(text.slice(first, last + 1));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const prompt = (req.body && req.body.prompt) ? String(req.body.prompt).trim() : '';
  if (!prompt || prompt.length < 4) {
    return res.status(400).json({ error: 'Prompt too short' });
  }
  if (prompt.length > 1200) {
    return res.status(400).json({ error: 'Prompt too long (max 1200 chars)' });
  }

  const chain = [
    { name: 'deepseek', fn: callDeepSeek },
    { name: 'gemini', fn: callGemini },
    { name: 'openrouter', fn: callOpenRouter },
  ];

  const errors = [];

  for (const provider of chain) {
    try {
      const raw = await provider.fn(prompt);
      const template = parseJSON(raw);
      return res.status(200).json({ ok: true, provider: provider.name, template });
    } catch (err) {
      errors.push({ provider: provider.name, message: String(err.message || err) });
    }
  }

  return res.status(502).json({
    error: 'All providers failed',
    details: errors,
  });
}