import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import IpoSelect from '../components/IpoSelect';
import { formatRupiah, formatDecimal, formatNumber } from '../utils/format';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { IpoData } from '../types';
import { fetchIpoById } from '../services/ipoService';
import { Calculator, RotateCcw, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import clsx from 'clsx';

interface ProfitResult {
  modal: number;
  nilaiJual: number;
  profit: number;
  persen: number;
  lot: number;
  lembar: number;
}

export default function KalkulatorProfit() {
  const [searchParams] = useSearchParams();
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [lot, setLot] = useState('1');
  const [selectedIpo, setSelectedIpo] = useState<IpoData | null>(null);
  const [result, setResult] = useState<ProfitResult | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const ipoId = searchParams.get('ipo');
    if (ipoId) {
      fetchIpoById(ipoId).then((d) => {
        if (d) {
          setSelectedIpo(d);
          setHargaBeli(d.ipoPrice.toString());
        }
      });
    }
  }, [searchParams]);

  const handleIpoSelect = (ipo: IpoData | null) => {
    setSelectedIpo(ipo);
    if (ipo) setHargaBeli(ipo.ipoPrice.toString());
    else setHargaBeli('');
    setResult(null);
  };

  const handleHitung = () => {
    const b = Number(hargaBeli.replace(/\./g, ''));
    const j = Number(hargaJual.replace(/\./g, ''));
    const l = Number(lot) || 1;
    if (isNaN(b) || b <= 0 || isNaN(j) || j <= 0) {
      addToast('Masukkan harga beli dan jual yang valid', 'error');
      return;
    }
    const lembar = l * 100;
    const modal = b * lembar;
    const nilaiJual = j * lembar;
    const profit = nilaiJual - modal;
    const persen = (profit / modal) * 100;
    setResult({ modal, nilaiJual, profit, persen, lot: l, lembar });
    addHistory('profit', `${formatRupiah(b)} → ${formatRupiah(j)}: ${persen >= 0 ? '+' : ''}${formatDecimal(persen, 2)}%`);
    addToast('Perhitungan berhasil!');
  };

  const handleReset = () => {
    setHargaBeli('');
    setHargaJual('');
    setLot('1');
    setResult(null);
    setSelectedIpo(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-6 anim-fade-up">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Kalkulator Profit IPO</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estimasi keuntungan investasi IPO</p>
      </div>

      <Card>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pilih IPO (opsional)</label>
            <IpoSelect value={selectedIpo?.id || ''} onChange={handleIpoSelect} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Harga Beli (Rp)</label>
              <input type="text" inputMode="numeric" value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} placeholder="120" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Harga Jual (Rp)</label>
              <input type="text" inputMode="numeric" value={hargaJual} onChange={(e) => setHargaJual(e.target.value)} placeholder="200" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Lot</label>
              <input type="text" inputMode="numeric" value={lot} onChange={(e) => setLot(e.target.value)} placeholder="1" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={handleHitung} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
            <Calculator className="w-4 h-4" /> Hitung
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </Card>

      {result && (
        <div className="space-y-3 anim-fade-up">
          <Card className={clsx('text-center py-6', result.profit > 0 ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : result.profit < 0 ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20' : 'bg-slate-50 dark:bg-slate-800/50')}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {result.profit > 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-500" /> : result.profit < 0 ? <ArrowDownRight className="w-5 h-5 text-red-500" /> : <Minus className="w-5 h-5 text-slate-400" />}
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estimasi Profit</p>
            </div>
            <p className={clsx('text-3xl font-extrabold', result.profit > 0 ? 'text-emerald-600 dark:text-emerald-400' : result.profit < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400')}>
              {result.profit >= 0 ? '+' : ''}{formatRupiah(result.profit)}
            </p>
            <p className={clsx('text-sm font-bold mt-1', result.profit > 0 ? 'text-emerald-500' : result.profit < 0 ? 'text-red-500' : 'text-slate-400')}>
              {result.persen >= 0 ? '+' : ''}{formatDecimal(result.persen, 2)}%
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Harga Beli', val: formatRupiah(Number(hargaBeli.replace(/\./g, ''))) },
              { label: 'Harga Jual', val: formatRupiah(Number(hargaJual.replace(/\./g, ''))) },
              { label: 'Lot', val: formatNumber(result.lot) },
              { label: 'Lembar Saham', val: formatNumber(result.lembar) },
              { label: 'Modal', val: formatRupiah(result.modal) },
              { label: 'Nilai Jual', val: formatRupiah(result.nilaiJual) },
            ].map((item) => (
              <div key={item.label} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{item.val}</p>
              </div>
            ))}
          </div>

          {Number(hargaBeli.replace(/\./g, '')) > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Simulasi Profit di Hari ARA Pertama</h3>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[0.20, 0.25, 0.35].map((p) => {
                  const hargaAra = Math.floor(Number(hargaBeli.replace(/\./g, '')) * (1 + p));
                  const jualAra = hargaAra * result.lembar;
                  const profitAra = jualAra - result.modal;
                  const persenAra = (profitAra / result.modal) * 100;
                  return (
                    <div key={p} className={clsx('p-3 rounded-xl border', profitAra > 0 ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10' : 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10')}>
                      <p className="text-[10px] text-slate-400 font-medium">ARA +{(p * 100).toFixed(0)}%</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{formatRupiah(hargaAra)}</p>
                      <p className={clsx('text-xs font-bold mt-0.5', profitAra >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {profitAra >= 0 ? '+' : ''}{formatRupiah(profitAra)}
                      </p>
                      <p className={clsx('text-[10px] font-semibold', profitAra >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                        {persenAra >= 0 ? '+' : ''}{formatDecimal(persenAra, 2)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}