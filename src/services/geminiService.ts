const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const parseGeminiJSON = <T>(text: string): T | null => {
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  try { return JSON.parse(clean) as T; } 
  catch { return null; }
};

export const callGemini = async (prompt: string): Promise<string | null> => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === 'YOUR_GEMINI_API_KEY') return null;
  
  try {
    const res = await fetch(`${API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Gemini API Error:', res.status, errData);
      return null;
    }
    
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error('Gemini Error:', e);
    return null;
  }
};