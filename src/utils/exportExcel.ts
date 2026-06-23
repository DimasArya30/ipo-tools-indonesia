import * as XLSX from 'xlsx';

export function exportPenjatahanExcel(
  ticker: string,
  rows: { label: string; value: string }[]
) {
  const ws = XLSX.utils.json_to_sheet(rows.map((r) => ({ Komponen: r.label, Nilai: r.value })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Penjatahan');
  XLSX.writeFile(wb, `penjatahan-${ticker}-${Date.now()}.xlsx`);
}

export function exportARAARBExcel(
  hargaAcuan: number,
  ara: number,
  arb: number,
  persen: number,
  simulasiARA: number[],
  simulasiARB: number[]
) {
  const wb = XLSX.utils.book_new();

  const summary = [
    { Komponen: 'Harga Acuan', Nilai: hargaAcuan },
    { Komponen: 'Persentase', Nilai: `${(persen * 100).toFixed(0)}%` },
    { Komponen: 'Harga ARA', Nilai: ara },
    { Komponen: 'Harga ARB', Nilai: arb },
  ];
  const ws1 = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

  const araData = simulasiARA.map((v, i) => ({ Hari: i + 1, Harga: v }));
  const arbData = simulasiARB.map((v, i) => ({ Hari: i + 1, Harga: v }));
  const ws2 = XLSX.utils.json_to_sheet(araData);
  const ws3 = XLSX.utils.json_to_sheet(arbData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Simulasi ARA');
  XLSX.utils.book_append_sheet(wb, ws3, 'Simulasi ARB');

  XLSX.writeFile(wb, `ara-arb-${Date.now()}.xlsx`);
}

export function exportModalExcel(
  results: { nama: string; hargaIPO: number; lotPerAkun: number; jumlahAkun: number; jumlahSaham: number; modalPerAkun: number; totalModal: number }[],
  grandTotal: number
) {
  const data = results.map((r) => ({
    'Nama Saham': r.nama,
    'Harga IPO': r.hargaIPO,
    'Lot/Akun': r.lotPerAkun,
    'Jumlah Akun': r.jumlahAkun,
    'Jumlah Saham': r.jumlahSaham,
    'Modal/Akun': r.modalPerAkun,
    'Total Modal': r.totalModal,
  }));
  data.push({
    'Nama Saham': 'TOTAL',
    'Harga IPO': 0,
    'Lot/Akun': 0,
    'Jumlah Akun': 0,
    'Jumlah Saham': 0,
    'Modal/Akun': 0,
    'Total Modal': grandTotal,
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modal IPO');
  XLSX.writeFile(wb, `modal-ipo-${Date.now()}.xlsx`);
}

export function importModalExcel(file: File): Promise<{ nama: string; hargaIPO: number; lotPerAkun: number; jumlahAkun: number }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const results = json
          .map((row) => ({
            nama: String(row['Nama Saham'] || row['nama'] || ''),
            hargaIPO: Number(row['Harga IPO'] || row['hargaIPO'] || 0),
            lotPerAkun: Number(row['Lot/Akun'] || row['lotPerAkun'] || 0),
            jumlahAkun: Number(row['Jumlah Akun'] || row['jumlahAkun'] || 0),
          }))
          .filter((r) => r.nama && r.hargaIPO > 0);
        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}