import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini] ERROR: GEMINI_API_KEY tidak ada');
    return res.status(500).json({ error: 'Server config error' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error('[Gemini Error]', error.status, error.message);
    return res.status(error.status || 500).json({ 
      error: 'Gagal memproses AI',
      details: error.message 
    });
  }
}