import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Baca API Key (TANPA VITE_ karena ini di backend)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini] ERROR: GEMINI_API_KEY tidak ada di Environment Variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Inisialisasi SDK Terbaru
    const ai = new GoogleGenAI({ apiKey });
    console.log(`[Gemini] SDK Initialized | Model: gemini-2.0-flash`);

    const startTime = Date.now();

    // Panggil menggunakan SDK Terbaru
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    console.log(`[Gemini] Success dalam ${Date.now() - startTime}ms`);
    return res.status(200).json({ text: response.text });
    
  } catch (error: any) {
    console.error(`[Gemini Error] ${error.status || 500}: ${error.message || JSON.stringify(error)}`);
    return res.status(error.status || 500).json({ 
      error: 'Gagal memproses AI',
      details: error.message 
    });
  }
}