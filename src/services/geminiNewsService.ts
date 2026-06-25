import type { NewsItem, NewsCategory, Sentiment } from '../types/news';
import { callGemini, parseGeminiJSON } from './geminiService';
import { getCache, setCache } from './cacheService';

interface GeminiNewsRes {
  summary: string;
  sentiment: Sentiment;
  impact: 'High' | 'Medium' | 'Low';
  confidence: number;
  category: NewsCategory;
  affectedStocks: string[];
}

export const enrichNewsWithAI = async (item: NewsItem): Promise<Partial<NewsItem>> => {
  const cacheKey = `news_${item.link}`;
  const cached = getCache<Partial<NewsItem>>(cacheKey);
  if (cached) return cached;

  const prompt = `Ringkas berita: "${item.title}". Berikan JSON: { "summary": "maks 3 kalimat", "sentiment": "Bullish/Bearish/Neutral", "impact": "High/Medium/Low", "confidence": 80, "category": "IPO/BEI/IHSG/Dividen/dll", "affectedStocks": ["TICKER"] }`;
  
  const raw = await callGemini(prompt);
  const parsed = raw ? parseGeminiJSON<GeminiNewsRes>(raw) : null;

  const res: Partial<NewsItem> = {
    summary: parsed?.summary || '',
    sentiment: parsed?.sentiment,
    impact: parsed?.impact,
    confidence: parsed?.confidence,
    category: parsed?.category,
    affectedStocks: parsed?.affectedStocks || [],
  };

  setCache(cacheKey, res, 15 * 60 * 1000); // 15 menit
  return res;
};