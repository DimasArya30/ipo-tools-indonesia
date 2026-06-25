export interface IPODataInput {
  tickerCode: string;
  companyName: string;
  ipoStatus: string;
  sector: string;
  subsector: string;
  listingBoard: string;
  finalPrice: number;
  sharesOffered: number;
  offeringPercentage: number;
  underwriters: string;
  bookBuildingOpening: string;
  bookBuildingClosing: string;
  offeringOpening: string;
  offeringClosing: string;
  closingDate: string;
  distributionDate: string;
  listingDate: string;
  website: string;
  lineOfBusiness: string;
  returnD1: number | null;
  returnD7: number | null;
  returnFromListing: number | null;
}

export interface ScoreBreakdown {
  sector: number;
  underwriter: number;
  fundRaising: number;
  offeringPercentage: number;
  listingBoard: number;
  businessQuality: number;
  historicalPerformance: number;
  liquidity: number;
  valuation: number;
  marketTiming: number;
}

export interface IPOScore {
  score: number;
  rating: string;
  risk: string;
  confidence: string;
  breakdown: ScoreBreakdown;
}

export interface IPOAnalysis {
  analysis: string;
  strength: string;
  weakness: string;
  shortTermPotential: string;
  longTermPotential: string;
  conclusion: string;
}