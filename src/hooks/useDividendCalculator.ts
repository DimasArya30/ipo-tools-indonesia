import { useMemo } from 'react';
import type { DividendInput, DividendResult } from '../types/dividend';
import { calculateDividend } from '../utils/dividendCalculations';

export const useDividendCalculator = (input: DividendInput) => {
  return useMemo(() => {
    if (input.currentPrice <= 0 || input.lots <= 0) return null;
    if (input.dps <= 0 && (input.totalDividend <= 0 || input.sharesOutstanding <= 0)) return null;
    return calculateDividend(input);
  }, [input.currentPrice, input.lots, input.dps, input.totalDividend, input.sharesOutstanding, input.buyPrice, input.isReinvested]);
};