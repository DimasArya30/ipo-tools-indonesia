export const parseGeminiJSON = <T>(text: string): T | null => {
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  try { return JSON.parse(clean) as T; } 
  catch { return null; }
};

export const callGemini = async (prompt: string): Promise<string | null> => {
  try {
    // Memanggil Vercel API Route milik kita sendiri (/api/gemini)
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error('[Frontend Gemini Error]', data.details || data.error);
      return null;
    }
    
    return data.text || null;
  } catch (e) {
    console.error('[Frontend Gemini Fetch Error]', e);
    return null;
  }
};