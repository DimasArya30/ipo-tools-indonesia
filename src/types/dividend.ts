export interface DividendInput {
  ticker: string;
  currentPrice: number;
  buyPrice: number;
  lots: number;
  dps: number;
  totalDividend: number;
  sharesOutstanding: number;
  isReinvested: boolean;
}

export interface DividendResult {
  sharesHeld: number;
  calculatedDPS: number;
  grossDividend: number;
  taxRate: number;
  taxAmount: number;
  netDividend: number;
  yieldPercentage: number;
  yieldOnCost: number;
  reinvestLots: number;
}