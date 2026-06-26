module.exports = async function handler(req, res) {
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
    console.log('[Gemini] Memanggil REST API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Gemini Error]', response.status, JSON.stringify(data));
      return res.status(response.status).json({ 
        error: 'Gagal memproses AI',
        details: data.error?.message || 'Unknown error' 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ text: text || null });
    
  } catch (error) {
    console.error('[Gemini System Error]', error.message);
    return res.status(500).json({ 
      error: 'Gagal memproses AI',
      details: error.message 
    });
  }
};