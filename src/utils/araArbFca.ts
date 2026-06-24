import { simulasi } from './araArbEngine';
import type { SimulasiOutput } from './araArbEngine';

export function getAraFca(harga: number, lot: number, hari: number, ipoDay: boolean): SimulasiOutput {
  return simulasi(harga, lot, hari, 'fca', 'ara', ipoDay);
}

export function getArbFca(harga: number, lot: number, hari: number, ipoDay: boolean): SimulasiOutput {
  return simulasi(harga, lot, hari, 'fca', 'arb', ipoDay);
}