export type { IpoData, IpoFilter, IpoStatusFilter } from './ipo';

export interface PenjatahanInput {
  ticker: string;
  totalDana: number;
  hargaIPO: number;
  oversubscribeLot: number;
  antrianInvestor: number;
}

export interface PenjatahanResult {
  jumlahLot: number;
  hargaPerLot: number;
  penyesuaianDib: number;
  penjatahanRitel: number;
  penjatahanBukanRitel: number;
  porsiPooling: number;
  poolingRitel: number;
  poolingBukanRitel: number;
  estimasi: number;
  estimasiBulat: number;
}

export interface SimulasiHariResult {
  hari: number;
  hargaSebelumnya: number;
  harga: number;
  perubahanHarian: number;
  perubahanTotal: number;
  nilaiPortofolio: number;
}

export type JenisSaham = 'reguler' | 'fca';

export interface SahamInput {
  id: string;
  nama: string;
  hargaIPO: number;
  lotPerAkun: number;
  jumlahAkun: number;
}

export interface SahamResult {
  id: string;
  nama: string;
  hargaIPO: number;
  lotPerAkun: number;
  jumlahAkun: number;
  jumlahSaham: number;
  modalPerAkun: number;
  totalModal: number;
}

export type HistoryType = 'penjatahan' | 'araarb' | 'modal' | 'profit';

export interface HistoryItem {
  id: string;
  type: HistoryType;
  date: string;
  summary: string;
}