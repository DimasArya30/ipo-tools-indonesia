import type {
  PenjatahanInput,
  PenjatahanResult,
  ARAARBResult,
  SahamInput,
  SahamResult,
} from '../types';

export function hitungPenjatahan(input: PenjatahanInput): PenjatahanResult {
  const hargaPerLot = input.hargaIPO * 100;
  const jumlahLot = input.totalDana / hargaPerLot;
  const penyesuaianDib = input.oversubscribeLot / 2;
  const penjatahanRitel = penyesuaianDib;
  const penjatahanBukanRitel = penyesuaianDib;
  const porsiPooling = input.totalDana * 0.2;
  const poolingRitel = porsiPooling / 2;
  const poolingBukanRitel = porsiPooling / 2;
  const denominator = input.antrianInvestor * (1 - input.humanError / 100);
  const estimasi = denominator > 0 ? penjatahanRitel / denominator : 0;
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

export function hitungARAARB(hargaAcuan: number): ARAARBResult {
  let persentase: number;
  if (hargaAcuan < 200) {
    persentase = 0.35;
  } else if (hargaAcuan <= 5000) {
    persentase = 0.25;
  } else {
    persentase = 0.2;
  }

  const hargaARA = hargaAcuan * (1 + persentase);
  const hargaARB = hargaAcuan * (1 - persentase);

  const simulasiARA: number[] = [];
  const simulasiARB: number[] = [];
  for (let i = 1; i <= 10; i++) {
    simulasiARA.push(hargaAcuan * Math.pow(1 + persentase, i));
    simulasiARB.push(hargaAcuan * Math.pow(1 - persentase, i));
  }

  return { hargaAcuan, persentase, hargaARA, hargaARB, simulasiARA, simulasiARB };
}

export function hitungSaham(item: SahamInput): SahamResult {
  const jumlahSaham = item.lotPerAkun * 100;
  const modalPerAkun = item.hargaIPO * jumlahSaham;
  const totalModal = modalPerAkun * item.jumlahAkun;
  return {
    id: item.id,
    nama: item.nama,
    hargaIPO: item.hargaIPO,
    lotPerAkun: item.lotPerAkun,
    jumlahAkun: item.jumlahAkun,
    jumlahSaham,
    modalPerAkun,
    totalModal,
  };
}

export function hitungSemuaSaham(items: SahamInput[]): SahamResult[] {
  return items.map(hitungSaham);
}