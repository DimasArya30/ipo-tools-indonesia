import type { DividendInput, DividendResult } from '../types/dividend';
import { TAX_CONFIG } from '../config/taxConfig';

export const calculateDividend = (input: DividendInput): DividendResult => {
  const sharesHeld = input.lots * 100;
  const calculatedDPS = input.dps > 0 ? input.dps : (input.totalDividend / input.sharesOutstanding);
  const grossDividend = sharesHeld * calculatedDPS;
  
  const taxRate = input.isReinvested ? TAX_CONFIG.reinvestRate : TAX_CONFIG.standardRate;
  const taxAmount = grossDividend * taxRate;
  const netDividend = grossDividend - taxAmount;
  
  const yieldPercentage = input.currentPrice > 0 ? (calculatedDPS / input.currentPrice) * 100 : 0;
  const yieldOnCost = input.buyPrice > 0 ? (calculatedDPS / input.buyPrice) * 100 : 0;
  
  const reinvestLots = input.isReinvested && input.currentPrice > 0 
    ? Math.floor(netDividend / (input.currentPrice * 100)) 
    : 0;

  return {
    sharesHeld,
    calculatedDPS,
    grossDividend,
    taxRate,
    taxAmount,
    netDividend,
    yieldPercentage,
    yieldOnCost,
    reinvestLots,
  };
};