import { useState } from 'react';
import Card from '../components/Card';
import { hitungARAARB } from '../utils/calculations';
import { formatRupiah, formatDecimal } from '../utils/format';
import { exportARAARBPdf } from '../utils/exportPdf';
import { exportARAARBExcel } from '../utils/exportExcel';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { ARAARBResult } from '../types';
import { Calculator, FileDown, FileSpreadsheet, Copy, RotateCcw, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const fmtAxis = (v: unknown) => Number(v).toLocaleString('id-ID');

const fmtTip = (value: unknown): [string, string] => {
  const num = Number(value);
  return [isNaN(num) ? '-' : formatRupiah(num), 'Harga'];
};

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #374151',
  backgroundColor: '#1f2937',
  color: '#f3f4f6',
  fontSize: '12px',
};

export default function KalkulatorARAARB() {
  const [harga, setHarga] = useState('');
  const [result, setResult] = useState<ARAARBResult | null>(null);
  const { addToast } = useToast();

  const handleHitung = () => {
    const num = Number(harga.replace(/\./g, '').replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      addToast('Masukkan harga acuan yang valid', 'error');
      return;
    }
    const res = hitungARAARB(num);
    setResult(res);
    addHistory('araarb', `Rp${num.toLocaleString('id-ID')}: ARA ${formatRupiah(res.hargaARA)}, ARB ${formatRupiah(res.hargaARB)}`);
    addToast('Perhitungan berhasil!');
  };

  const handleReset = () => {
    setHarga('');
    setResult(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Harga Acuan: ${formatRupiah(result.hargaAcuan)}\nPersentase: ${(result.persentase * 100).toFixed(0)}%\nHarga ARA: ${formatRupiah(result.hargaARA)}\nHarga ARB: ${formatRupiah(result.hargaARB)}\n\nSimulasi ARA 10 Hari:\n${result.simulasiARA.map((v, i) => `Hari ${i + 1}: ${formatRupiah(v)}`).join('\n')}\n\nSimulasi ARB 10 Hari:\n${result.simulasiARB.map((v, i) => `Hari ${i + 1}: ${formatRupiah(v)}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    addToast('Berhasil disalin ke clipboard!');
  };

  const handlePdf = () => {
    if (!result) return;
    exportARAARBPdf(result.hargaAcuan, result.hargaARA, result.hargaARB, result.persentase, result.simulasiARA, result.simulasiARB);
    addToast('Berhasil export ke PDF!');
  };

  const handleExcel = () => {
    if (!result) return;
    exportARAARBExcel(result.hargaAcuan, result.hargaARA, result.hargaARB, result.persentase, result.simulasiARA, result.simulasiARB);
    addToast('Berhasil export ke Excel!');
  };

  const araChartData = result?.simulasiARA.map((v, i) => ({ hari: `H${i + 1}`, harga: v })) || [];
  const arbChartData = result?.simulasiARB.map((v, i) => ({ hari: `H${i + 1}`, harga: v })) || [];

  const getTierLabel = (h: number) => {
    if (h < 200) return '< Rp200 → ±35%';
    if (h <= 5000) return 'Rp200 - Rp5.000 → ±25%';
    return '> Rp5.000 → ±20%';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kalkulator ARA & ARB</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Menghitung batas Auto Rejection berdasarkan aturan BEI
        </p>
      </div>

      <Card>
        <div className="max-w-sm">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Harga Acuan (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            placeholder="Contoh: 150"
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button onClick={handleHitung} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Calculator className="w-4 h-4" />
            Hitung
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 animate-fade-in">
            <Card className="border-l-4 border-l-gray-400">
              <p className="text-xs text-gray-500 dark:text-gray-400">Harga Acuan</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupiah(result.hargaAcuan)}</p>
              <p className="text-[10px] text-gray-400 mt-1">{getTierLabel(result.hargaAcuan)}</p>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Harga ARA</p>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatRupiah(result.hargaARA)}</p>
              <p className="text-[10px] text-emerald-500/70 mt-1">+{(result.persentase * 100).toFixed(0)}%</p>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-red-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Harga ARB</p>
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{formatRupiah(result.hargaARB)}</p>
              <p className="text-[10px] text-red-500/70 mt-1">-{(result.persentase * 100).toFixed(0)}%</p>
            </Card>
          </div>

          <Card className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Simulasi 10 Hari & Grafik</h2>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Simulasi ARA</h3>
                </div>
                <div className="h-52 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={araChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="hari" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtAxis as any} />
                      <Tooltip formatter={fmtTip as any} contentStyle={tooltipStyle} />
                      <ReferenceLine y={result.hargaAcuan} stroke="#6b7280" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="harga" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Hari</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-semibold">Harga ARA</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-semibold">Naik dari Acuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.simulasiARA.map((v, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : ''}>
                          <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">Hari {i + 1}</td>
                          <td className="py-1.5 px-2 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatRupiah(v)}</td>
                          <td className="py-1.5 px-2 text-right text-emerald-500/70">+{formatDecimal(((v - result.hargaAcuan) / result.hargaAcuan) * 100, 1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Simulasi ARB</h3>
                </div>
                <div className="h-52 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={arbChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="hari" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={fmtAxis as any} />
                      <Tooltip formatter={fmtTip as any} contentStyle={tooltipStyle} />
                      <ReferenceLine y={result.hargaAcuan} stroke="#6b7280" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="harga" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Hari</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-semibold">Harga ARB</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-semibold">Turun dari Acuan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.simulasiARB.map((v, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-red-50/30 dark:bg-red-500/5' : ''}>
                          <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">Hari {i + 1}</td>
                          <td className="py-1.5 px-2 text-right font-medium text-red-600 dark:text-red-400">{formatRupiah(v)}</td>
                          <td className="py-1.5 px-2 text-right text-red-500/70">{formatDecimal(((v - result.hargaAcuan) / result.hargaAcuan) * 100, 1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}