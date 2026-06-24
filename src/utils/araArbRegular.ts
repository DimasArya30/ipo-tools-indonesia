import { simulasi } from './araArbEngine';
import type { SimulasiOutput } from './araArbEngine';

export function getAraRegular(harga: number, lot: number, hari: number, ipoDay: boolean): SimulasiOutput {
  return simulasi(harga, lot, hari, 'reguler', 'ara', ipoDay);
}

export function getArbRegular(harga: number, lot: number, hari: number, ipoDay: boolean): SimulasiOutput {
  return simulasi(harga, lot, hari, 'reguler', 'arb', ipoDay);
}