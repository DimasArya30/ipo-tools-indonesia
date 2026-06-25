import type { IPODataInput, IPOScore, IPOAnalysis } from '../types/score';
import { calculateIPOScore } from '../utils/scoreEngine';
import { callGemini, parseGeminiJSON } from './geminiService';
import { getCache, setCache } from './cacheService';

export const getIPOScoreAndAnalysis = async (ipo: IPODataInput): Promise<{ score: IPOScore; analysis: IPOAnalysis | null }> => {
  const cacheKey = `score_${ipo.tickerCode}_${ipo.ipoStatus}_${ipo.finalPrice}`;
  const cached = getCache<{ score: IPOScore; analysis: IPOAnalysis | null }>(cacheKey);
  if (cached) return cached;

  const score = calculateIPOScore(ipo);
  let analysis: IPOAnalysis | null = null;

  const prompt = `Anda adalah analis IPO Indonesia. Jangan mengubah IPO Score.
Data: Ticker ${ipo.tickerCode}, Company ${ipo.companyName}, Sector ${ipo.sector}, Business ${ipo.lineOfBusiness}.
IPO Score: ${score.score}. Rating: ${score.rating}. Harga: ${ipo.finalPrice}. Offering: ${ipo.offeringPercentage}%. Underwriter: ${ipo.underwriters}. Board: ${ipo.listingBoard}. Return D1: ${ipo.returnD1}%.
Berikan JSON: { "analysis": "...", "strength": "...", "weakness": "...", "shortTermPotential": "...", "longTermPotential": "...", "conclusion": "..." }`;

  const raw = await callGemini(prompt);
  if (raw) analysis = parseGeminiJSON<IPOAnalysis>(raw);

  const result = { score, analysis };
  setCache(cacheKey, result, 24 * 60 * 60 * 1000); // Cache 24 jam
  return result;
};