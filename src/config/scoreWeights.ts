export const WEIGHTS = {
  sector: 0.15,
  underwriter: 0.15,
  fundRaising: 0.15,
  offeringPercentage: 0.10,
  listingBoard: 0.10,
  businessQuality: 0.10,
  historicalPerformance: 0.10,
  liquidity: 0.10,
  valuation: 0.05,
  marketTiming: 0.10,
};

export const SECTOR_SCORES: Record<string, number> = {
  'teknologi': 15, 'finansial': 14, 'kesehatan': 14, 'perbankan': 14,
  'konsumsi': 12, 'industri': 11, 'properti': 10, 'telekomunikasi': 12,
  'energi': 10, 'pertambangan': 9, 'perkebunan': 8, 'transportasi': 8,
};

export const TOP_UNDERWRITERS = [
  'mandiri sekuritas', 'bca sekuritas', 'mirae asset', 'morgan stanley', 
  'goldman sachs', 'jpmorgan', 'bahana sekuritas', 'danareksa', 'indopremier'
];