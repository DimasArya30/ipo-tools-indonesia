import { applyFraksi } from './fraksiHarga';
import type { SimulasiHariResult } from '../types';

export function getAraPersen(harga: number): number {
  if (harga < 200) return 0.35;
  if (harga <= 5000) return 0.25;
  return 0.20;
}

export function getArbPersen(harga: number): number {
  return getAraPersen(harga);
}

export function simulasiARA(hargaAcuan: number, lot: number, totalHari: number): SimulasiHariResult[] {
  const results: SimulasiHariResult[] = [];
  let harga = hargaAcuan;
  for (let i = 1; i <= totalHari; i++) {
    const persen = getAraPersen(harga);
    harga = applyFraksi(harga * (1 + persen));
    results.push({ hari: i, harga, persen, nilaiPortofolio: harga * lot * 100 });
  }
  return results;
}

export function simulasiARB(hargaAcuan: number, lot: number, totalHari: number): SimulasiHariResult[] {
  const results: SimulasiHariResult[] = [];
  let harga = hargaAcuan;
  for (let i = 1; i <= totalHari; i++) {
    const persen = getArbPersen(harga);
    harga = applyFraksi(harga * (1 - persen));
    results.push({ hari: i, harga, persen, nilaiPortofolio: harga * lot * 100 });
  }
  return results;
}