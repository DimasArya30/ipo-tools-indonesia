import { useState } from 'react';
import Card from '../components/Card';
import IpoSelect from '../components/IpoSelect';
import { simulasi } from '../utils/araArbEngine';
import type { SimulasiOutput } from '../utils/araArbEngine';
import { formatRupiah, formatDecimal } from '../utils/format';
import { addHistory } from '../services/storage';
import { useToast } from '../context/ToastContext';
import type { JenisSaham, IpoData } from '../types';
import { Calculator, Copy, RotateCcw, Info } from 'lucide-react';
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
  const [ipoDay, setIpoDay] = useState(false);
  const [selectedIpo, setSelectedIpo] = useState<IpoData | null>(null);
  const [araOut, setAraOut] = useState<SimulasiOutput | null>(null);
  const [arbOut, setArbOut] = useState<SimulasiOutput | null>(null);
  const { addToast } = useToast();

  const handleIpoSelect = (ipo: IpoData | null) => {
    setSelectedIpo(ipo);
    setHarga(ipo ? ipo.finalPrice.toString() : '');
  };

  const handleHitung = () => {
    const h = Number(harga.replace(/\./g, ''));
    const l = Number(lot) || 1;
    const d = Number(hari) || 10;
    if (isNaN(h) || h <= 0) { addToast('Masukkan harga acuan valid', 'error'); return; }
    setAraOut(simulasi(h, l, d, jenis, 'ara', ipoDay));
    setArbOut(simulasi(h, l, d, jenis, 'arb', ipoDay));
    const label = jenis === 'fca' ? 'FCA ±10%' : (h < 200 ? '±35%' : h <= 5000 ? '±25%' : '±20%');
    addHistory('araarb', `Rp${h.toLocaleString('id-ID')} (${label})${ipoDay ? ' IPO Day' : ''}`);
    addToast('Perhitungan berhasil!');
  };

  const hNum = Number(harga.replace(/\./g, '')) || 0;

  const handleCopy = () => {
    if (!araOut || !arbOut) return;
    const t = [
      `Harga: ${formatRupiah(hNum)} | ${jenis === 'fca' ? 'FCA' : 'Reguler'} | Lot: ${lot}${ipoDay ? ' | IPO Day' : ''}`,
      'ARA:', ...araOut.results.map((r) => `  #${r.hari}: ${formatRupiah(r.harga)} | ${formatRupiah(r.nilaiPortofolio)} | ${formatDecimal(r.perubahanHarian)}%`),
      'ARB:', ...arbOut.results.map((r) => `  #${r.hari}: ${formatRupiah(r.harga)} | ${formatRupiah(r.nilaiPortofolio)} | ${formatDecimal(r.perubahanHarian)}%`)
    ].join('\n');
    navigator.clipboard.writeText(t); addToast('Disalin!');
  };

  const araChart = araOut?.results.map((r) => ({ h: `#${r.hari}`, harga: r.harga })) || [];
  const arbChart = arbOut?.results.map((r) => ({ h: `#${r.hari}`, harga: r.harga })) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-6 anim-fade-up">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Kalkulator ARA & ARB</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fraksi harga BEI diterapkan setiap hari. Reguler & FCA terpisah.</p>
      </div>

      <Card>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pilih IPO (opsional)</label>
            <IpoSelect value={selectedIpo?.tickerCode || ''} onChange={handleIpoSelect} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Inp label="Harga Acuan (Rp)" value={harga} onChange={setHarga} placeholder="150" />
            <Inp label="Lot" value={lot} onChange={setLot} placeholder="1" />
            <Inp label="Jumlah Hari" value={hari} onChange={setHari} placeholder="10" />
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Jenis Saham</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as JenisSaham)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="reguler">Reguler</option>
                <option value="fca">FCA / Papan Pantauan</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              className={clsx('w-10 h-6 rounded-full transition-colors relative', ipoDay ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600')}
              onClick={() => setIpoDay(!ipoDay)}
            >
              <div className={clsx('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all', ipoDay ? 'left-5' : 'left-1')} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">IPO Day</span>
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={handleHitung}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Calculator className="w-4 h-4" />Hitung
          </button>
          <button
            onClick={() => {
              setHarga('');
              setLot('1');
              setHari('10');
              setIpoDay(false);
              setAraOut(null);
              setArbOut(null);
              setSelectedIpo(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />Reset
          </button>
        </div>
      </Card>

      {araOut && arbOut && (
        <>
          {ipoDay && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 anim-fade-up">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Hari pertama pencatatan saham tidak memiliki batas ARB sesuai ketentuan BEI. Simulasi ARB dimulai dari hari ke-2.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5 anim-fade-up">
            <Card className="text-center">
              <p className="text-[10px] text-slate-400 font-medium">Harga Acuan</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatRupiah(hNum)}</p>
              <p className="text-[9px] text-slate-400">
                {jenis === 'fca' ? 'FCA ±10%' : 'Reguler'}{ipoDay ? ' · IPO Day' : ''}
              </p>
            </Card>
            <Card className="text-center border-l-4 border-l-emerald-500">
              <p className="text-[10px] text-slate-400 font-medium">ARA #1</p>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {araOut.results[0] ? formatRupiah(araOut.results[0].harga) : '-'}
              </p>
              <p className="text-[9px] text-emerald-500/70">
                +{formatDecimal(araOut.results[0]?.perubahanHarian || 0)}%
              </p>
            </Card>
            <Card className="text-center border-l-4 border-l-red-500">
              <p className="text-[10px] text-slate-400 font-medium">ARB #1</p>
              <p className="text-lg font-extrabold text-red-600 dark:text-red-400">
                {arbOut.results[0] ? formatRupiah(arbOut.results[0].harga) : '-'}
              </p>
              <p className="text-[9px] text-red-500/70">
                {arbOut.results[0] ? formatDecimal(arbOut.results[0].perubahanHarian) + '%' : 'N/A'}
              </p>
            </Card>
          </div>

          <Card className="anim-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Simulasi Lengkap</h2>
              <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimulasiSection
                title="Simulasi ARA"
                data={araOut}
                chart={araChart}
                color="emerald"
                acuan={hNum}
                isArb={false}
              />
              <SimulasiSection
                title="Simulasi ARB"
                data={arbOut}
                chart={arbChart}
                color="red"
                acuan={hNum}
                isArb={true}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function SimulasiSection({
  title,
  data,
  chart,
  color,
  acuan,
  isArb,
}: {
  title: string;
  data: SimulasiOutput;
  chart: { h: string; harga: number }[];
  color: string;
  acuan: number;
  isArb: boolean;
}) {
  const isGreen = color === 'emerald';
  return (
    <div>
      <h3
        className={clsx(
          'text-xs font-bold uppercase tracking-wider mb-2',
          isGreen
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-600 dark:text-red-400'
        )}
      >
        {title}
      </h3>
      <div className="h-44 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="h" tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis
              tick={{ fontSize: 9, fill: '#94a3b8' }}
              tickFormatter={fmtAxis as any}
            />
            <Tooltip formatter={fmtTip as any} contentStyle={tipStyle} />
            <ReferenceLine y={acuan} stroke="#475569" strokeDasharray="3 3" />
            <Line
              type="stepAfter"
              dataKey="harga"
              stroke={isGreen ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {data.results.map((r) => (
          <div
            key={r.hari}
            className={clsx(
              'p-3 rounded-xl border',
              isGreen
                ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
                : 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10'
            )}
          >
            <p
              className={clsx(
                'text-[10px] font-bold uppercase tracking-wider',
                isGreen ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {isGreen ? 'ARA' : 'ARB'} #{r.hari}
            </p>
            <p
              className={clsx(
                'text-lg font-extrabold mt-0.5',
                isGreen
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
              )}
            >
              {formatRupiah(r.harga)}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {formatRupiah(r.nilaiPortofolio)}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
              <p
                className={clsx(
                  'text-[10px] font-semibold',
                  isGreen
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {isArb ? '↓' : '↑'} {formatDecimal(Math.abs(r.perubahanHarian))}% hari ini
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Total {isArb ? '↓' : '↑'} {formatDecimal(Math.abs(r.perubahanTotal))}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Inp({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
      />
    </div>
  );
}