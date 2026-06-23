import { useState } from 'react';
import Card from '../components/Card';
import { hitungPenjatahan } from '../utils/calculations';
import { formatRupiah, formatNumber, formatDecimal } from '../utils/format';
import { exportPenjatahanPdf } from '../utils/exportPdf';
import { exportPenjatahanExcel } from '../utils/exportExcel';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { PenjatahanInput, PenjatahanResult } from '../types';
import { Calculator, FileDown, FileSpreadsheet, Copy, RotateCcw } from 'lucide-react';

const initialInput: PenjatahanInput = {
  ticker: '',
  totalDana: 0,
  hargaIPO: 0,
  oversubscribeLot: 0,
  antrianInvestor: 0,
  humanError: 0,
};

export default function EstimasiPenjatahan() {
  const [input, setInput] = useState<PenjatahanInput>(initialInput);
  const [result, setResult] = useState<PenjatahanResult | null>(null);
  const { addToast } = useToast();

  const handleChange = (field: keyof PenjatahanInput, value: string) => {
    const num = value === '' ? 0 : Number(value.replace(/\./g, '').replace(/,/g, ''));
    setInput((prev) => ({ ...prev, [field]: field === 'ticker' ? value : (isNaN(num) ? 0 : num) }));
  };

  const handleHitung = () => {
    if (!input.ticker || input.totalDana <= 0 || input.hargaIPO <= 0 || input.antrianInvestor <= 0) {
      addToast('Lengkapi semua input yang diperlukan', 'error');
      return;
    }
    const res = hitungPenjatahan(input);
    setResult(res);
    addHistory('penjatahan', `${input.ticker}: Estimasi ${res.estimasiBulat} lot`);
    addToast('Perhitungan berhasil!');
  };

  const handleReset = () => {
    setInput(initialInput);
    setResult(null);
  };

  const getRows = (): { label: string; value: string }[] => {
    if (!result) return [];
    return [
      { label: 'Jumlah Lot IPO', value: formatNumber(Math.floor(result.jumlahLot)) },
      { label: 'Harga Saham per Lot', value: formatRupiah(result.hargaPerLot) },
      { label: 'Penyesuaian Dib', value: formatNumber(Math.floor(result.penyesuaianDib)) },
      { label: 'Penjatahan Ritel', value: formatNumber(Math.floor(result.penjatahanRitel)) },
      { label: 'Penjatahan Bukan Ritel', value: formatNumber(Math.floor(result.penjatahanBukanRitel)) },
      { label: 'Porsi Pooling', value: formatRupiah(result.porsiPooling) },
      { label: 'Pooling Ritel', value: formatRupiah(result.poolingRitel) },
      { label: 'Pooling Bukan Ritel', value: formatRupiah(result.poolingBukanRitel) },
      { label: 'Estimasi Penjatahan', value: formatDecimal(result.estimasi, 4) },
      { label: 'Estimasi Penjatahan Bulat', value: formatNumber(result.estimasiBulat) + ' lot' },
    ];
  };

  const handleCopy = () => {
    const text = getRows().map((r) => `${r.label}: ${r.value}`).join('\n');
    navigator.clipboard.writeText(text);
    addToast('Berhasil disalin ke clipboard!');
  };

  const handlePdf = () => {
    exportPenjatahanPdf(input.ticker, getRows());
    addToast('Berhasil export ke PDF!');
  };

  const handleExcel = () => {
    exportPenjatahanExcel(input.ticker, getRows());
    addToast('Berhasil export ke Excel!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estimasi Penjatahan IPO</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Mengestimasi jumlah lot yang kemungkinan diperoleh investor saat IPO
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Ticker Saham"
            value={input.ticker}
            onChange={(v) => handleChange('ticker', v)}
            placeholder="Contoh: PRDI"
          />
          <InputField
            label="Total Dana Dihimpun (Rp)"
            value={input.totalDana > 0 ? input.totalDana.toLocaleString('id-ID') : ''}
            onChange={(v) => handleChange('totalDana', v)}
            placeholder="Contoh: 5000000000"
          />
          <InputField
            label="Harga IPO per Lembar (Rp)"
            value={input.hargaIPO > 0 ? input.hargaIPO.toLocaleString('id-ID') : ''}
            onChange={(v) => handleChange('hargaIPO', v)}
            placeholder="Contoh: 120"
          />
          <InputField
            label="Oversubscribe Lot"
            value={input.oversubscribeLot > 0 ? input.oversubscribeLot.toLocaleString('id-ID') : ''}
            onChange={(v) => handleChange('oversubscribeLot', v)}
            placeholder="Contoh: 50000"
          />
          <InputField
            label="Asumsi Antrian Investor"
            value={input.antrianInvestor > 0 ? input.antrianInvestor.toLocaleString('id-ID') : ''}
            onChange={(v) => handleChange('antrianInvestor', v)}
            placeholder="Contoh: 10000"
          />
          <InputField
            label="Human Error (%)"
            value={input.humanError > 0 ? input.humanError.toString() : ''}
            onChange={(v) => handleChange('humanError', v)}
            placeholder="Contoh: 5"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={handleHitung}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Calculator className="w-4 h-4" />
            Hitung
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </Card>

      {result && (
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Hasil — {input.ticker}
            </h2>
            <div className="flex gap-1.5">
              <button onClick={handleCopy} title="Copy" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button onClick={handlePdf} title="Export PDF" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <FileDown className="w-4 h-4" />
              </button>
              <button onClick={handleExcel} title="Export Excel" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getRows().map((row) => (
              <div
                key={row.label}
                className={`p-4 rounded-xl border border-gray-100 dark:border-gray-800 ${
                  row.label === 'Estimasi Penjatahan Bulat'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{row.label}</p>
                <p className={`text-lg font-bold ${
                  row.label === 'Estimasi Penjatahan Bulat'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Komponen</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {getRows().map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}>
                    <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300">{row.label}</td>
                    <td className="py-2.5 px-4 text-right font-medium text-gray-900 dark:text-white">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
      <input
        type="text"
        inputMode={label.includes('Ticker') ? 'text' : 'numeric'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
      />
    </div>
  );
}