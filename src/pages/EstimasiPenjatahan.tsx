import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import IpoSelect from '../components/IpoSelect';
import { hitungPenjatahan } from '../utils/calculations';
import { formatRupiah, formatNumber, formatDecimal } from '../utils/format';
import { exportPenjatahanPdf } from '../utils/exportPdf';
import { exportPenjatahanExcel } from '../utils/exportExcel';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { PenjatahanInput, PenjatahanResult, IpoData } from '../types';
import { Calculator, FileDown, FileSpreadsheet, Copy, RotateCcw } from 'lucide-react';
import { fetchIpoById } from '../services/ipoService';

const initial: PenjatahanInput = { ticker: '', totalDana: 0, hargaIPO: 0, oversubscribeLot: 0, antrianInvestor: 0 };

export default function EstimasiPenjatahan() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState<PenjatahanInput>(initial);
  const [result, setResult] = useState<PenjatahanResult | null>(null);
  const [selectedIpo, setSelectedIpo] = useState<IpoData | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const ipoId = searchParams.get('ipo');
    if (ipoId) { fetchIpoById(ipoId).then((d) => { if (d) { setSelectedIpo(d); setInput((p) => ({ ...p, ticker: d.ticker, totalDana: d.fundraising, hargaIPO: d.ipoPrice })); } }); }
  }, [searchParams]);

  const handleIpoSelect = (ipo: IpoData | null) => {
    setSelectedIpo(ipo);
    if (ipo) { setInput((p) => ({ ...p, ticker: ipo.ticker, totalDana: ipo.fundraising, hargaIPO: ipo.ipoPrice })); }
    else { setInput((p) => ({ ...p, ticker: '', totalDana: 0, hargaIPO: 0 })); }
    setResult(null);
  };

  const setNum = (field: keyof PenjatahanInput, val: string) => {
    const n = Number(val.replace(/\./g, '').replace(/,/g, ''));
    setInput((p) => ({ ...p, [field]: field === 'ticker' ? val : (isNaN(n) ? 0 : n) }));
  };

  const handleHitung = () => {
    if (!input.ticker || input.totalDana <= 0 || input.hargaIPO <= 0 || input.antrianInvestor <= 0) { addToast('Lengkapi semua input', 'error'); return; }
    const r = hitungPenjatahan(input);
    setResult(r);
    addHistory('penjatahan', `${input.ticker}: Estimasi ${r.estimasiBulat} lot`);
    addToast('Perhitungan berhasil!');
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
      { label: 'Human Error', value: '20%' },
      { label: 'Faktor Koreksi', value: '1,25' },
      { label: 'Estimasi Penjatahan', value: formatDecimal(result.estimasi, 2) + ' lot' },
      { label: 'Estimasi Penjatahan Bulat', value: formatNumber(result.estimasiBulat) + ' lot' },
    ];
  };

  const handleCopy = () => { navigator.clipboard.writeText(getRows().map((r) => `${r.label}: ${r.value}`).join('\n')); addToast('Disalin ke clipboard!'); };
  const handlePdf = () => { exportPenjatahanPdf(input.ticker, getRows()); addToast('Export PDF berhasil!'); };
  const handleExcel = () => { exportPenjatahanExcel(input.ticker, getRows()); addToast('Export Excel berhasil!'); };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-6 anim-fade-up">
      <div><h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Estimasi Penjatahan IPO</h1><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Human Error otomatis 20%, Faktor Koreksi 1,25</p></div>

      <Card>
        <div className="space-y-3">
          <div><label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pilih IPO</label><IpoSelect value={selectedIpo?.id || ''} onChange={handleIpoSelect} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Inp label="Ticker Saham" value={input.ticker} onChange={(v) => setNum('ticker', v)} placeholder="PRDI" />
            <Inp label="Total Dana Dihimpun (Rp)" value={input.totalDana > 0 ? input.totalDana.toLocaleString('id-ID') : ''} onChange={(v) => setNum('totalDana', v)} placeholder="5000000000" />
            <Inp label="Harga IPO per Lembar (Rp)" value={input.hargaIPO > 0 ? input.hargaIPO.toLocaleString('id-ID') : ''} onChange={(v) => setNum('hargaIPO', v)} placeholder="120" />
            <Inp label="Oversubscribe Lot" value={input.oversubscribeLot > 0 ? input.oversubscribeLot.toLocaleString('id-ID') : ''} onChange={(v) => setNum('oversubscribeLot', v)} placeholder="50000" />
            <Inp label="Asumsi Antrian Investor" value={input.antrianInvestor > 0 ? input.antrianInvestor.toLocaleString('id-ID') : ''} onChange={(v) => setNum('antrianInvestor', v)} placeholder="10000" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={handleHitung} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"><Calculator className="w-4 h-4" />Hitung</button>
          <button onClick={() => { setInput(initial); setSelectedIpo(null); setResult(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl transition-colors"><RotateCcw className="w-4 h-4" />Reset</button>
        </div>
      </Card>

      {result && (
        <Card className="anim-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Hasil — {input.ticker}</h2>
            <div className="flex gap-1">
              {[handleCopy, handlePdf, handleExcel].map((fn, i) => (
                <button key={i} onClick={fn} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">{[Copy, FileDown, FileSpreadsheet][i] && <>{[Copy, FileDown, FileSpreadsheet].map((Icon, j) => j === i && <Icon key={j} className="w-4 h-4" />)}</>}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {getRows().map((row) => (
              <div key={row.label} className={`p-3.5 rounded-xl border ${row.label.includes('Bulat') ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'}`}>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{row.label}</p>
                <p className={`text-base font-bold mt-0.5 ${row.label.includes('Bulat') ? 'text-emerald-600 dark:text-emerald-400 text-lg' : 'text-slate-900 dark:text-white'}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      <input type="text" inputMode={label.includes('Ticker') ? 'text' : 'numeric'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
    </div>
  );
}