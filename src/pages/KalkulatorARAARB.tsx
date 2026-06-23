import { useState } from 'react';
import Card from '../components/Card';
import IpoSelect from '../components/IpoSelect';
import { getAraPersen, getArbPersen, simulasiARA, simulasiARB } from '../utils/araArbRegular';
import { simulasiARAFca, simulasiARBFca } from '../utils/araArbFca';
import { formatRupiah, formatDecimal } from '../utils/format';
import { exportARAARBPdf } from '../utils/exportPdf';
import { exportARAARBExcel } from '../utils/exportExcel';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { SimulasiHariResult, JenisSaham, IpoData } from '../types';
import { Calculator, FileDown, FileSpreadsheet, Copy, RotateCcw, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import clsx from 'clsx';

const fmtAxis = (v: unknown) => Number(v).toLocaleString('id-ID');
const fmtTip = (value: unknown): [string, string] => { const n = Number(value); return [isNaN(n) ? '-' : formatRupiah(n), 'Harga']; };
const tipStyle = { borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f1f5f9', fontSize: '12px' };

export default function KalkulatorARAARB() {
  const [harga, setHarga] = useState('');
  const [lot, setLot] = useState('1');
  const [hari, setHari] = useState('10');
  const [jenis, setJenis] = useState<JenisSaham>('reguler');
  const [selectedIpo, setSelectedIpo] = useState<IpoData | null>(null);
  const [araResult, setAraResult] = useState<SimulasiHariResult[]>([]);
  const [arbResult, setArbResult] = useState<SimulasiHariResult[]>([]);
  const { addToast } = useToast();

  const handleIpoSelect = (ipo: IpoData | null) => { setSelectedIpo(ipo); if (ipo) setHarga(ipo.ipoPrice.toString()); else setHarga(''); };

  const handleHitung = () => {
    const h = Number(harga.replace(/\./g, ''));
    const l = Number(lot) || 1;
    const d = Number(hari) || 10;
    if (isNaN(h) || h <= 0) { addToast('Masukkan harga acuan valid', 'error'); return; }

    const isFca = jenis === 'fca';
    const ara = isFca ? simulasiARAFca(h, l, d) : simulasiARA(h, l, d);
    const arb = isFca ? simulasiARBFca(h, l, d) : simulasiARB(h, l, d);
    setAraResult(ara);
    setArbResult(arb);

    const persen = isFca ? '35%/25% (FCA)' : `${(getAraPersen(h) * 100).toFixed(0)}%`;
    addHistory('araarb', `Rp${h.toLocaleString('id-ID')} (${persen}): ARA ${formatRupiah(ara[0]?.harga || 0)}`);
    addToast('Perhitungan berhasil!');
  };

  const hNum = Number(harga.replace(/\./g, '')) || 0;
  const persenAra = jenis === 'fca' ? '35% → 25%' : `${(getAraPersen(hNum) * 100).toFixed(0)}%`;
  const persenArb = jenis === 'fca' ? '35% → 25%' : `${(getArbPersen(hNum) * 100).toFixed(0)}%`;

  const handleCopy = () => {
    const t = `Harga Acuan: ${formatRupiah(hNum)} | Jenis: ${jenis === 'fca' ? 'FCA' : 'Reguler'} | Lot: ${lot}\nARA:\n${araResult.map((r) => `H${r.hari}: ${formatRupiah(r.harga)} | Portofolio: ${formatRupiah(r.nilaiPortofolio)}`).join('\n')}\nARB:\n${arbResult.map((r) => `H${r.hari}: ${formatRupiah(r.harga)} | Portofolio: ${formatRupiah(r.nilaiPortofolio)}`).join('\n')}`;
    navigator.clipboard.writeText(t); addToast('Disalin!');
  };
  const handlePdf = () => { if (!araResult.length) return; exportARAARBPdf(hNum, araResult[0].harga, arbResult[0].harga, araResult[0].persen, araResult.map((r) => r.harga), arbResult.map((r) => r.harga)); addToast('PDF berhasil!'); };
  const handleExcel = () => { if (!araResult.length) return; exportARAARBExcel(hNum, araResult[0].harga, arbResult[0].harga, araResult[0].persen, araResult.map((r) => r.harga), arbResult.map((r) => r.harga)); addToast('Excel berhasil!'); };

  const araChart = araResult.map((r) => ({ h: `H${r.hari}`, harga: r.harga, porto: r.nilaiPortofolio }));
  const arbChart = arbResult.map((r) => ({ h: `H${r.hari}`, harga: r.harga, porto: r.nilaiPortofolio }));

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-6 anim-fade-up">
      <div><h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Kalkulator ARA & ARB</h1><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fraksi harga diterapkan setiap hari. Reguler & FCA terpisah.</p></div>

      <Card>
        <div className="space-y-3">
          <div><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pilih IPO (opsional)</label><IpoSelect value={selectedIpo?.id || ''} onChange={handleIpoSelect} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Harga Acuan (Rp)</label><input type="text" inputMode="numeric" value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="150" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" /></div>
            <div><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Lot</label><input type="text" inputMode="numeric" value={lot} onChange={(e) => setLot(e.target.value)} placeholder="1" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" /></div>
            <div><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jumlah Hari</label><input type="text" inputMode="numeric" value={hari} onChange={(e) => setHari(e.target.value)} placeholder="10" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" /></div>
            <div><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jenis Saham</label><select value={jenis} onChange={(e) => setJenis(e.target.value as JenisSaham)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"><option value="reguler">Reguler</option><option value="fca">FCA & Akselerasi</option></select></div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={handleHitung} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"><Calculator className="w-4 h-4" />Hitung</button>
          <button onClick={() => { setHarga(''); setLot('1'); setHari('10'); setAraResult([]); setArbResult([]); setSelectedIpo(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl transition-colors"><RotateCcw className="w-4 h-4" />Reset</button>
        </div>
      </Card>

      {araResult.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2.5 anim-fade-up">
            <Card className="text-center"><p className="text-[10px] text-slate-400 font-medium">Harga Acuan</p><p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatRupiah(hNum)}</p><p className="text-[9px] text-slate-400">{jenis === 'fca' ? 'FCA' : 'Reguler'}</p></Card>
            <Card className="text-center border-l-4 border-l-emerald-500"><p className="text-[10px] text-slate-400 font-medium">ARA Hari 1</p><p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{formatRupiah(araResult[0].harga)}</p><p className="text-[9px] text-emerald-500/70">+{persenAra}</p></Card>
            <Card className="text-center border-l-4 border-l-red-500"><p className="text-[10px] text-slate-400 font-medium">ARB Hari 1</p><p className="text-lg font-extrabold text-red-600 dark:text-red-400">{formatRupiah(arbResult[0].harga)}</p><p className="text-[9px] text-red-500/70">-{persenArb}</p></Card>
          </div>

          <Card className="anim-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Simulasi & Grafik</h2>
              <div className="flex gap-1">{[handleCopy, handlePdf, handleExcel].map((fn, i) => <button key={i} onClick={fn} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">{[Copy, FileDown, FileSpreadsheet][i] && <>{[Copy, FileDown, FileSpreadsheet].map((Icon, j) => j === i && <Icon key={j} className="w-4 h-4" />)}</>}</button>)}</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { title: 'Simulasi ARA', data: araResult, chart: araChart, color: 'emerald', Icon: TrendingUp },
                { title: 'Simulasi ARB', data: arbResult, chart: arbChart, color: 'red', Icon: TrendingDown },
              ].map(({ title, data, chart, color, Icon }) => (
                <div key={title}>
                  <div className="flex items-center gap-2 mb-2"><Icon className={clsx('w-4 h-4', color === 'emerald' ? 'text-emerald-500' : 'text-red-500')} /><h3 className={clsx('text-xs font-bold uppercase tracking-wider', color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>{title}</h3></div>
                  <div className="h-48 mb-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} /><XAxis dataKey="h" tick={{ fontSize: 9, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={fmtAxis as any} /><Tooltip formatter={fmtTip as any} contentStyle={tipStyle} /><ReferenceLine y={hNum} stroke="#475569" strokeDasharray="3 3" /><Line type="monotone" dataKey="harga" stroke={color === 'emerald' ? '#10b981' : '#ef4444'} strokeWidth={2} dot={{ r: 2.5 }} /></LineChart></ResponsiveContainer></div>
                  <div className="overflow-x-auto"><table className="w-full text-[11px]">
                    <thead><tr className="border-b border-slate-200 dark:border-slate-700"><th className="text-left py-1.5 px-1.5 text-slate-400 font-semibold">Hari</th><th className="text-right py-1.5 px-1.5 text-slate-400 font-semibold">Harga</th><th className="text-right py-1.5 px-1.5 text-slate-400 font-semibold">%</th><th className="text-right py-1.5 px-1.5 text-slate-400 font-semibold">Portofolio</th></tr></thead>
                    <tbody>{data.map((r) => (
                      <tr key={r.hari} className={clsx(r.hari % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : '')}>
                        <td className="py-1.5 px-1.5 text-slate-600 dark:text-slate-400">H{r.hari}</td>
                        <td className={clsx('py-1.5 px-1.5 text-right font-semibold', color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>{formatRupiah(r.harga)}</td>
                        <td className="py-1.5 px-1.5 text-right text-slate-400">{(r.persen * 100).toFixed(0)}%</td>
                        <td className="py-1.5 px-1.5 text-right font-medium text-slate-700 dark:text-slate-300">{formatRupiah(r.nilaiPortofolio)}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}