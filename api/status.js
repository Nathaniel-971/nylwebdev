/* Kepler status — tells client if AI is available
   Copyright (c) 2026 Nathaniel Nyl / Nyl Web Dev. All rights reserved. */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');
  const providers = [];
  if (process.env.DEEPSEEK_API_KEY)   providers.push('deepseek');
  if (process.env.GEMINI_API_KEY)     providers.push('gemini');
  if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');
  return res.status(200).json({
    ok: providers.length > 0,
    providers: providers,
    checkedAt: new Date().toISOString()
  });
}
