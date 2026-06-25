import type { IPODataInput, IPOScore, ScoreBreakdown } from '../types/score';
import { WEIGHTS, SECTOR_SCORES, TOP_UNDERWRITERS } from '../config/scoreWeights';

const getSectorScore = (s: string): number => SECTOR_SCORES[s.toLowerCase()] || 7;
const getUnderwriterScore = (u: string): number => {
  const lower = u.toLowerCase();
  if (TOP_UNDERWRITERS.some(t => lower.includes(t))) return 15;
  if (lower.includes('sekuritas')) return 10;
  return 5;
};
const getFundScore = (price: number, shares: number): number => {
  const fund = price * shares;
  if (fund > 1_000_000_000_000) return 15;
  if (fund > 500_000_000_000) return 12;
  if (fund > 100_000_000_000) return 8;
  return 5;
};
const getOfferingScore = (pct: number): number => {
  if (pct >= 15 && pct <= 25) return 10;
  if (pct >= 10 && pct < 15) return 8;
  return 6;
};
const getBoardScore = (b: string): number => b.toLowerCase().includes('utama') ? 10 : 5;
const getBusinessScore = (biz: string): number => {
  const lower = biz.toLowerCase();
  if (['teknologi', 'digital', 'ekosistem', 'green'].some(k => lower.includes(k))) return 15;
  if (['konsumsi', 'retail', 'food'].some(k => lower.includes(k))) return 12;
  return 8;
};
const getHistScore = (r: number | null): number => {
  if (r === null || r === undefined) return 5; // Default jika belum listing
  if (r > 50) return 10;
  if (r > 20) return 8;
  if (r >= 0) return 5;
  return 2;
};
const getLiquidityScore = (shares: number): number => {
  if (shares > 10_000_000_000) return 10;
  if (shares > 5_000_000_000) return 8;
  if (shares > 1_000_000_000) return 5;
  return 2;
};

export const calculateIPOScore = (ipo: IPODataInput): IPOScore => {
  const b: ScoreBreakdown = {
    sector: getSectorScore(ipo.sector),
    underwriter: getUnderwriterScore(ipo.underwriters),
    fundRaising: getFundScore(ipo.finalPrice, ipo.sharesOffered),
    offeringPercentage: getOfferingScore(ipo.offeringPercentage),
    listingBoard: getBoardScore(ipo.listingBoard),
    businessQuality: getBusinessScore(ipo.lineOfBusiness),
    historicalPerformance: getHistScore(ipo.returnD1),
    liquidity: getLiquidityScore(ipo.sharesOffered),
    valuation: 5, // Deterministic placeholder
    marketTiming: 7, // Deterministic placeholder
  };

  const score = Math.round((
    b.sector * WEIGHTS.sector +
    b.underwriter * WEIGHTS.underwriter +
    b.fundRaising * WEIGHTS.fundRaising +
    b.offeringPercentage * WEIGHTS.offeringPercentage +
    b.listingBoard * WEIGHTS.listingBoard +
    b.businessQuality * WEIGHTS.businessQuality +
    b.historicalPerformance * WEIGHTS.historicalPerformance +
    b.liquidity * WEIGHTS.liquidity +
    b.valuation * WEIGHTS.valuation +
    b.marketTiming * WEIGHTS.marketTiming
  ) * 10) / 10;

  return {
    score,
    rating: calculateRating(score),
    risk: calculateRisk(score),
    confidence: calculateConfidence(ipo),
    breakdown: b,
  };
};

export const calculateRating = (s: number): string => {
  if (s >= 90) return '★★★★★ Excellent';
  if (s >= 80) return '★★★★☆ Very Good';
  if (s >= 70) return '★★★★ Good';
  if (s >= 60) return '★★★ Average';
  if (s >= 50) return '★★ Below Average';
  return '★ High Risk';
};

export const calculateRisk = (s: number): string => {
  if (s >= 80) return 'Low';
  if (s >= 60) return 'Medium';
  return 'High';
};

export const calculateConfidence = (ipo: IPODataInput): string => {
  let c = 0;
  if (ipo.finalPrice > 0) c += 20;
  if (ipo.returnD1 !== null) c += 30;
  if (ipo.underwriters) c += 20;
  if (ipo.sector) c += 15;
  if (ipo.lineOfBusiness) c += 15;
  return `${c}%`;
};