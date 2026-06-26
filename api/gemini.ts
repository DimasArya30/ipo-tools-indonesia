import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Baca API Key dari Environment Variable Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini] ERROR: GEMINI_API_KEY tidak ditemukan di Environment Variables');
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    // Inisialisasi SDK Terbaru
    const ai = new GoogleGenAI({ apiKey });
    console.log(`[Gemini SDK initialized] Model: gemini-2.0-flash | Env: ${process.env.VERCEL_ENV || 'development'}`);

    const startTime = Date.now();
    
    // Panggil API Menggunakan SDK Terbaru
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    const responseTime = Date.now() - startTime;
    console.log(`[Gemini Success] Response Time: ${responseTime}ms`);

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error(`[Gemini Error] Status: ${error.status || 500}`);
    console.error(`[Gemini Error] Body: ${JSON.stringify(error.message || error)}`);
    
    return res.status(error.status || 500).json({ 
      error: 'Failed to generate content',
      details: error.message || 'Unknown error'
    });
  }
}