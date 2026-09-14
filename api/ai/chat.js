const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
  'gemini-flash-latest'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, systemInstruction, history = [] } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt string is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey.length > 10) {
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const contentsPayload = [
          ...history.map(item => ({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          })),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ];

        const apiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction || 'You are StudySpace AI, an intelligent, empathetic web tutor for college students. Explain concepts step-by-step with clear markdown headings, clean math formulas, and practical code examples.' }]
            },
            contents: contentsPayload,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 16384,
            }
          })
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const candidate = data.candidates?.[0];
          const parts = candidate?.content?.parts || [];
          const fullText = parts.map(p => p.text || '').join('');

          if (fullText.trim()) {
            return res.status(200).json({
              text: fullText.trim(),
              modelUsed: `gemini (${model})`,
              isFallback: false
            });
          }
        }
      } catch (err) {
        console.error(`Vercel AI handler model ${model} error:`, err.message);
      }
    }
  }

  // Return non-OK to trigger client fallback
  return res.status(503).json({ error: 'Live Gemini API key missing or unavailable on Vercel.' });
}
