// server.js - for Render Web Service
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname))); // Serves your HTML, CSS, JS

// The API endpoint that Kepler calls
app.post('/api/kepler', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const systemPrompt = "You are Kepler... [YOUR FULL SYSTEM PROMPT HERE]";

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
        })
      }
    );

    const data = await geminiRes.json();
    const text = data.candidates[0].content.parts[0].text;
    res.json({ ok: true, template: JSON.parse(text) });

  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'AI generation failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kepler server running on port ${PORT}`);
});