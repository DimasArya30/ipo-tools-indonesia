import type { PenjatahanInput, PenjatahanResult, SahamInput, SahamResult } from '../types';

export function hitungPenjatahan(input: PenjatahanInput): PenjatahanResult {
  const hargaPerLot = input.hargaIPO * 100;
  const jumlahLot = input.hargaIPO > 0 ? input.totalDana / hargaPerLot : 0;
  const penyesuaianDib = input.oversubscribeLot / 2;
  const penjatahanRitel = penyesuaianDib;
  const penjatahanBukanRitel = penyesuaianDib;
  const porsiPooling = input.totalDana * 0.2;
  const poolingRitel = porsiPooling / 2;
  const poolingBukanRitel = porsiPooling / 2;

  // Human Error otomatis 20%, Faktor Koreksi = 1.25
  const antrian = input.antrianInvestor > 0 ? input.antrianInvestor : 1;
  const estimasi = (penjatahanRitel / antrian) * 1.25;
  const estimasiBulat = Math.round(estimasi);

  return {
    jumlahLot,
    hargaPerLot,
    penyesuaianDib,
    penjatahanRitel,
    penjatahanBukanRitel,
    porsiPooling,
    poolingRitel,
    poolingBukanRitel,
    estimasi,
    estimasiBulat,
  };
}

export function hitungSaham(item: SahamInput): SahamResult {
  const jumlahSaham = item.lotPerAkun * 100;
  const modalPerAkun = item.hargaIPO * jumlahSaham;
  const totalModal = modalPerAkun * item.jumlahAkun;
  return { id: item.id, nama: item.nama, hargaIPO: item.hargaIPO, lotPerAkun: item.lotPerAkun, jumlahAkun: item.jumlahAkun, jumlahSaham, modalPerAkun, totalModal };
}

export function hitungSemuaSaham(items: SahamInput[]): SahamResult[] {
  return items.map(hitungSaham);
}