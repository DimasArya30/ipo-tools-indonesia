import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import IpoSelect from '../components/IpoSelect';
import { simulasi } from '../utils/araArbEngine';
import type { SimulasiOutput } from '../utils/araArbEngine';
import { formatRupiah, formatDecimal, formatNumber } from '../utils/format';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { JenisSaham, IpoData } from '../types';
import { fetchIpoById } from '../services/ipoService';
import { Calculator, RotateCcw, ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';
import clsx from 'clsx';

export default function KalkulatorProfit() {
  const [searchParams] = useSearchParams();
  const [hargaBeli, setHargaBeli] = useState('');
  const [lot, setLot] = useState('1');
  const [jenis, setJenis] = useState<JenisSaham>('reguler');
  const [ipoDay, setIpoDay] = useState(false);
  const [hari, setHari] = useState('10');
  const [selectedIpo, setSelectedIpo] = useState<IpoData | null>(null);
  const [araOut, setAraOut] = useState<SimulasiOutput | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const ipoId = searchParams.get('ipo');
    if (ipoId) fetchIpoById(ipoId).then((d) => { if (d) { setSelectedIpo(d); setHargaBeli(d.ipoPrice.toString()); } });
  }, [searchParams]);

  const handleIpoSelect = (ipo: IpoData | null) => { setSelectedIpo(ipo); setHargaBeli(ipo ? ipo.ipoPrice.toString() : ''); };

  const handleHitung = () => {
    const b = Number(hargaBeli.replace(/\./g, ''));
    const l = Number(lot) || 1;
    const d = Number(hari) || 10;
    if (isNaN(b) || b <= 0) { addToast('Masukkan harga beli yang valid', 'error'); return; }
    setAraOut(simulasi(b, l, d, jenis, 'ara', ipoDay));
    addHistory('profit', `Rp${b.toLocaleString('id-ID')} × ${l} lot (${jenis}${ipoDay ? ' IPO Day' : ''})`);
    addToast('Perhitungan berhasil!');
  };

  const handleReset = () => { setHargaBeli(''); setLot('1'); setHari('10'); setIpoDay(false); setAraOut(null); setSelectedIpo(null); };

  const hNum = Number(hargaBeli.replace(/\./g, '')) || 0;
  const modal = hNum * (Number(lot) || 1) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-6 anim-fade-up">
      <div><h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Kalkulator Profit IPO</h1><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Engine sama dengan ARA & ARB — single source of truth</p></div>

      <Card>
        <div className="space-y-3">
          <div><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pilih IPO (opsional)</label><IpoSelect value={selectedIpo?.id || ''} onChange={handleIpoSelect} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Inp label="Harga Beli (Rp)" value={hargaBeli} onChange={setHargaBeli} placeholder="150" />
            <Inp label="Lot" value={lot} onChange={setLot} placeholder="1" />
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jenis</label>
              <select value={jenis} onChange={(e) => setJenis(e.target.value as JenisSaham)} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"><option value="reguler">Reguler</option><option value="fca">FCA</option></select>
            </div>
            <Inp label="Jumlah Hari" value={hari} onChange={setHari} placeholder="10" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className={clsx('w-10 h-6 rounded-full transition-colors relative', ipoDay ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600')} onClick={() => setIpoDay(!ipoDay)}>
              <div className={clsx('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all', ipoDay ? 'left-5' : 'left-1')} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">IPO Day</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={handleHitung} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"><Calculator className="w-4 h-4" />Hitung</button>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl transition-colors"><RotateCcw className="w-4 h-4" />Reset</button>
        </div>
      </Card>

      {araOut && (
        <>
          {ipoDay && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 anim-fade-up">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">IPO Day aktif — ARA hari pertama +35%, tidak ada ARB hari pertama.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 anim-fade-up">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-400 font-medium">Modal</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatRupiah(modal)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] text-slate-400 font-medium">Lembar Saham</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatNumber((Number(lot) || 1) * 100)}</p>
            </div>
          </div>

          <div className="anim-fade-up">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Simulasi Profit ARA Hari per Hari</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {araOut.results.map((r) => {
                const profit = r.nilaiPortofolio - modal;
                const persen = (profit / modal) * 100;
                return (
                  <div key={r.hari} className={clsx('p-3.5 rounded-xl border transition-colors', profit > 0 ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10' : profit < 0 ? 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700')}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">ARA #{r.hari}</p>
                      {profit > 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : profit < 0 ? <ArrowDownRight className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">{formatRupiah(r.harga)}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{formatRupiah(r.nilaiPortofolio)}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <p className={clsx('text-sm font-extrabold', profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : profit < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500')}>
                        {profit >= 0 ? '+' : ''}{formatRupiah(profit)}
                      </p>
                      <p className={clsx('text-[10px] font-semibold', profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-slate-400')}>
                        {persen >= 0 ? '+' : ''}{formatDecimal(persen)}%
                      </p>
                    </div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">↑ {formatDecimal(r.perubahanTotal)}% dari harga awal</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      <input type="text" inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
    </div>
  );
}