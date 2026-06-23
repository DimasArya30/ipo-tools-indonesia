import { useState, useRef } from 'react';
import Card from '../components/Card';
import { hitungSemuaSaham } from '../utils/calculations';
import { formatRupiah, formatNumber } from '../utils/format';
import { exportModalPdf } from '../utils/exportPdf';
import { exportModalExcel, importModalExcel } from '../utils/exportExcel';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { SahamInput, SahamResult } from '../types';
import { Calculator, Plus, Trash2, FileDown, FileSpreadsheet, FileUp, Copy, RotateCcw, Wallet } from 'lucide-react';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

function createEmpty(): SahamInput {
  return { id: genId(), nama: '', hargaIPO: 0, lotPerAkun: 0, jumlahAkun: 0 };
}

export default function KalkulatorModal() {
  const [items, setItems] = useState<SahamInput[]>([createEmpty()]);
  const [results, setResults] = useState<SahamResult[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const updateItem = (id: string, field: keyof SahamInput, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'nama') return { ...item, nama: value };
        const num = Number(value.replace(/\./g, '').replace(/,/g, ''));
        return { ...item, [field]: isNaN(num) ? 0 : num };
      })
    );
  };

  const addItem = () => setItems((prev) => [...prev, createEmpty()]);

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      addToast('Minimal harus ada 1 saham', 'error');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setResults(null);
  };

  const handleHitung = () => {
    const valid = items.every((i) => i.nama && i.hargaIPO > 0 && i.lotPerAkun > 0 && i.jumlahAkun > 0);
    if (!valid) {
      addToast('Lengkapi semua data saham', 'error');
      return;
    }
    const res = hitungSemuaSaham(items);
    setResults(res);
    const total = res.reduce((s, r) => s + r.totalModal, 0);
    addHistory('modal', `${res.length} saham — Total ${formatRupiah(total)}`);
    addToast('Perhitungan berhasil!');
  };

  const handleReset = () => {
    setItems([createEmpty()]);
    setResults(null);
  };

  const grandTotal = results ? results.reduce((s, r) => s + r.totalModal, 0) : 0;

  const handleCopy = () => {
    if (!results) return;
    const header = '| Nama Saham | Harga IPO | Lot/Akun | Jumlah Akun | Jumlah Saham | Modal/Akun | Total Modal |';
    const sep = '| --- | --- | --- | --- | --- | --- | --- |';
    const rows = results.map((r) => `| ${r.nama} | ${formatRupiah(r.hargaIPO)} | ${r.lotPerAkun} | ${r.jumlahAkun} | ${formatNumber(r.jumlahSaham)} | ${formatRupiah(r.modalPerAkun)} | ${formatRupiah(r.totalModal)} |`);
    const text = [header, sep, ...rows, '', `TOTAL MODAL KESELURUHAN: ${formatRupiah(grandTotal)}`].join('\n');
    navigator.clipboard.writeText(text);
    addToast('Berhasil disalin ke clipboard!');
  };

  const handlePdf = () => {
    if (!results) return;
    exportModalPdf(results, grandTotal);
    addToast('Berhasil export ke PDF!');
  };

  const handleExcel = () => {
    if (!results) return;
    exportModalExcel(results, grandTotal);
    addToast('Berhasil export ke Excel!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importModalExcel(file);
      if (data.length === 0) {
        addToast('Tidak ada data yang bisa dibaca', 'error');
        return;
      }
      setItems(data.map((d) => ({ ...d, id: genId() })));
      setResults(null);
      addToast(`Berhasil import ${data.length} saham!`);
    } catch {
      addToast('Gagal membaca file Excel', 'error');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kalkulator Kebutuhan Modal IPO</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Hitung kebutuhan modal IPO untuk banyak akun sekaligus
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Daftar Saham IPO</h2>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
            Import Excel
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Saham #{idx + 1}</span>
                <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Nama Saham</label>
                  <input type="text" value={item.nama} onChange={(e) => updateItem(item.id, 'nama', e.target.value)} placeholder="PRDI" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Harga IPO (Rp)</label>
                  <input type="text" inputMode="numeric" value={item.hargaIPO > 0 ? item.hargaIPO.toLocaleString('id-ID') : ''} onChange={(e) => updateItem(item.id, 'hargaIPO', e.target.value)} placeholder="120" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Lot / Akun</label>
                  <input type="text" inputMode="numeric" value={item.lotPerAkun > 0 ? item.lotPerAkun.toLocaleString('id-ID') : ''} onChange={(e) => updateItem(item.id, 'lotPerAkun', e.target.value)} placeholder="2" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">Jumlah Akun</label>
                  <input type="text" inputMode="numeric" value={item.jumlahAkun > 0 ? item.jumlahAkun.toLocaleString('id-ID') : ''} onChange={(e) => updateItem(item.id, 'jumlahAkun', e.target.value)} placeholder="10" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button onClick={addItem} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            Tambah Saham
          </button>
          <button onClick={handleHitung} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Calculator className="w-4 h-4" />
            Hitung Semua
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </Card>

      {results && (
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Hasil Perhitungan</h2>
            <div className="flex gap-1.5">
              <button onClick={handleCopy} title="Copy" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={handlePdf} title="PDF" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <FileDown className="w-4 h-4" />
              </button>
              <button onClick={handleExcel} title="Excel" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Saham</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Harga IPO</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lot/Akun</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah Akun</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah Saham</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modal/Akun</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Modal</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}>
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">{r.nama}</td>
                    <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{formatRupiah(r.hargaIPO)}</td>
                    <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{formatNumber(r.lotPerAkun)}</td>
                    <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{formatNumber(r.jumlahAkun)}</td>
                    <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{formatNumber(r.jumlahSaham)}</td>
                    <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{formatRupiah(r.modalPerAkun)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-white">{formatRupiah(r.totalModal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">TOTAL MODAL KESELURUHAN</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(grandTotal)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Saham</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                {formatNumber(results.reduce((s, r) => s + r.jumlahSaham, 0))}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Akun</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                {formatNumber(results.reduce((s, r) => s + r.jumlahAkun, 0))}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Jumlah Emiten</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{results.length}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}