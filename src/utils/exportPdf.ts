import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type helper untuk akses lastAutoTable
function getLastY(doc: jsPDF): number {
  return (doc as any).lastAutoTable?.finalY ?? 80;
}

export function exportPenjatahanPdf(
  ticker: string,
  rows: { label: string; value: string }[]
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Estimasi Penjatahan - ${ticker}`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Komponen', 'Nilai']],
    body: rows.map((r) => [r.label, r.value]),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
  });

  doc.save(`penjatahan-${ticker}-${Date.now()}.pdf`);
}

export function exportARAARBPdf(
  hargaAcuan: number,
  ara: number,
  arb: number,
  persen: number,
  simulasiARA: number[],
  simulasiARB: number[]
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Kalkulator ARA & ARB', 14, 20);
  doc.setFontSize(10);
  doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Komponen', 'Nilai']],
    body: [
      ['Harga Acuan', `Rp${hargaAcuan.toLocaleString('id-ID')}`],
      ['Persentase', `${(persen * 100).toFixed(0)}%`],
      ['Harga ARA', `Rp${ara.toLocaleString('id-ID')}`],
      ['Harga ARB', `Rp${arb.toLocaleString('id-ID')}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 10 },
  });

  const araRows = simulasiARA.map((v, i) => [
    `Hari ${i + 1}`,
    `Rp${v.toLocaleString('id-ID')}`,
  ]);
  const arbRows = simulasiARB.map((v, i) => [
    `Hari ${i + 1}`,
    `Rp${v.toLocaleString('id-ID')}`,
  ]);

  // Ambil posisi Y setelah tabel pertama
  const y1 = getLastY(doc);
  doc.text('Simulasi ARA 10 Hari', 14, y1 + 10);

  autoTable(doc, {
    startY: y1 + 15,
    head: [['Hari', 'Harga']],
    body: araRows,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
  });

  // Ambil posisi Y setelah tabel ARA
  const y2 = getLastY(doc);
  doc.text('Simulasi ARB 10 Hari', 14, y2 + 10);

  autoTable(doc, {
    startY: y2 + 15,
    head: [['Hari', 'Harga']],
    body: arbRows,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 9 },
  });

  doc.save(`ara-arb-${Date.now()}.pdf`);
}

export function exportModalPdf(
  results: { nama: string; hargaIPO: number; lotPerAkun: number; jumlahAkun: number; jumlahSaham: number; modalPerAkun: number; totalModal: number }[],
  grandTotal: number
) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('Kalkulator Kebutuhan Modal IPO Multi Akun', 14, 20);
  doc.setFontSize(10);
  doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Nama Saham', 'Harga IPO', 'Lot/Akun', 'Jumlah Akun', 'Jumlah Saham', 'Modal/Akun', 'Total Modal']],
    body: results.map((r) => [
      r.nama,
      `Rp${r.hargaIPO.toLocaleString('id-ID')}`,
      r.lotPerAkun.toString(),
      r.jumlahAkun.toString(),
      r.jumlahSaham.toLocaleString('id-ID'),
      `Rp${r.modalPerAkun.toLocaleString('id-ID')}`,
      `Rp${r.totalModal.toLocaleString('id-ID')}`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
  });

  const y = getLastY(doc);
  doc.setFontSize(12);
  doc.text(`TOTAL MODAL KESELURUHAN: Rp${grandTotal.toLocaleString('id-ID')}`, 14, y + 15);

  doc.save(`modal-ipo-${Date.now()}.pdf`);
}