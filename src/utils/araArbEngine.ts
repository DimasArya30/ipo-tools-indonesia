import { applyFraksi } from './fraksiHarga';

export interface SimulasiHariResult {
  hari: number;
  hargaSebelumnya: number;
  harga: number;
  perubahanHarian: number;
  perubahanTotal: number;
  nilaiPortofolio: number;
}

export interface SimulasiOutput {
  hargaAcuan: number;
  results: SimulasiHariResult[];
}

export type JenisSaham = 'reguler' | 'fca';

function getPersenReguler(harga: number): number {
  if (harga < 200) return 0.35;
  if (harga <= 5000) return 0.25;
  return 0.20;
}

export function simulasi(
  hargaAcuan: number,
  lot: number,
  totalHari: number,
  jenis: JenisSaham,
  arah: 'ara' | 'arb',
  ipoDay: boolean
): SimulasiOutput {
  const results: SimulasiHariResult[] = [];
  let harga = hargaAcuan;
  const minHarga = jenis === 'fca' ? 1 : 50;

  for (let i = 1; i <= totalHari; i++) {
    if (ipoDay && i === 1 && arah === 'arb') continue;

    const hargaSebelumnya = harga;
    let persen: number;

    if (ipoDay && i === 1 && arah === 'ara') {
      persen = 0.35;
    } else if (jenis === 'fca') {
      persen = 0.10;
    } else {
      persen = getPersenReguler(hargaSebelumnya);
    }

    harga = arah === 'ara'
      ? hargaSebelumnya * (1 + persen)
      : hargaSebelumnya * (1 - persen);

    harga = applyFraksi(harga);

    if (arah === 'arb' && harga < minHarga) harga = minHarga;

    const perubahanHarian = ((harga - hargaSebelumnya) / hargaSebelumnya) * 100;
    const perubahanTotal = ((harga - hargaAcuan) / hargaAcuan) * 100;

    results.push({
      hari: i,
      hargaSebelumnya,
      harga,
      perubahanHarian,
      perubahanTotal,
      nilaiPortofolio: harga * lot * 100,
    });
  }

  return { hargaAcuan, results };
}