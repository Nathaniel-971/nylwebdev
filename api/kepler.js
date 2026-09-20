/* Kepler — multi-provider AI design generator
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */

const SYSTEM_PROMPT = `You are Kepler, a UI design generator for Nyl Dev — a studio that builds websites AND mobile apps.

The user describes what they want. Return ONLY valid JSON. No markdown. No explanation.

{
  "name": "Short brand name",
  "tagline": "One line",
  "type": "website" or "app",
  "industry": "e.g. restaurant, fitness, social",
  "colors": {
    "background": "#hex6",
    "surface": "#hex6",
    "primary": "#hex6",
    "secondary": "#hex6",
    "accent": "#hex6",
    "text": "#hex6",
    "muted": "#hex6"
  },
  "fonts": { "heading": "serif"|"sans"|"mono", "body": "serif"|"sans"|"mono" },
  "layout": "minimal"|"luxury"|"bold"|"playful"|"corporate",
  "sections": ["hero", "services", "about", "contact"],
  "notes": "One sentence"
}

Rules:
- Valid 6-digit hex codes starting with #
- "app" sections: feed, profile, settings
- "website" sections: hero, services, about, contact, pricing
- Output ONLY the JSON.`;

async function tryDeepSeek(prompt) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('deepseek unavailable');
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error('deepseek ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function tryGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('gemini unavailable');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
    })
  });
  if (!res.ok) throw new Error('gemini ' + res.status);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function tryOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('openrouter unavailable');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key,
      'HTTP-Referer': 'https://nylwebdev.vercel.app',
      'X-Title': 'Kepler'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
      models: ['google/gemini-2.0-flash-001', 'anthropic/claude-3.5-haiku'],
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error('openrouter ' + res.status);
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON(raw) {
  if (!raw) throw new Error('empty response');
  let text = String(raw).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('no json');
  return JSON.parse(text.slice(first, last + 1));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  const body = req.body || {};
  const prompt = (body.prompt || '').trim();
  if (!prompt || prompt.length < 4) return res.status(400).json({ ok: false, error: 'Prompt too short' });
  if (prompt.length > 1200) return res.status(400).json({ ok: false, error: 'Prompt too long' });

  const providers = [
    { name: 'deepseek', fn: tryDeepSeek },
    { name: 'gemini', fn: tryGemini },
    { name: 'openrouter', fn: tryOpenRouter }
  ];

  const errors = [];
  for (const p of providers) {
    try {
      const raw = await p.fn(prompt);
      const template = parseJSON(raw);
      return res.status(200).json({ ok: true, provider: p.name, template });
    } catch (err) {
      errors.push({ provider: p.name, message: String(err.message || err) });
    }
  }
  return res.status(502).json({ ok: false, error: 'All providers unavailable', providers: errors });
}
