import { applyFraksi } from './fraksiHarga';
import type { SimulasiHariResult } from '../types';

function getAraPersenFca(hari: number): number {
  return hari === 1 ? 0.35 : 0.25;
}

function getArbPersenFca(hari: number): number {
  return hari === 1 ? 0.35 : 0.25;
}

export function simulasiARAFca(hargaAcuan: number, lot: number, totalHari: number): SimulasiHariResult[] {
  const results: SimulasiHariResult[] = [];
  let harga = hargaAcuan;
  for (let i = 1; i <= totalHari; i++) {
    const persen = getAraPersenFca(i);
    harga = applyFraksi(harga * (1 + persen));
    results.push({ hari: i, harga, persen, nilaiPortofolio: harga * lot * 100 });
  }
  return results;
}

export function simulasiARBFca(hargaAcuan: number, lot: number, totalHari: number): SimulasiHariResult[] {
  const results: SimulasiHariResult[] = [];
  let harga = hargaAcuan;
  for (let i = 1; i <= totalHari; i++) {
    const persen = getArbPersenFca(i);
    harga = applyFraksi(harga * (1 - persen));
    results.push({ hari: i, harga, persen, nilaiPortofolio: harga * lot * 100 });
  }
  return results;
}