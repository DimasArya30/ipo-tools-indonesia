import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

export const parseGeminiJSON = <T>(text: string): T | null => {
  let clean = text.trim();

  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(clean) as T;
  } catch {
    return null;
  }
};

export const callGemini = async (
  prompt: string
): Promise<string | null> => {
  try {
    if (!apiKey) {
      console.error("Gemini API Key belum ditemukan.");
      return null;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (err) {
    console.error("Gemini Error:", err);
    return null;
  }
};