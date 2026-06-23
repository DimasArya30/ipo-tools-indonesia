import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { useIpo } from '../hooks/useIpo';
import { getHistory, clearHistory } from '../services/storage';
import { formatDate, formatDana } from '../utils/format';
import type { HistoryItem } from '../types';
import { Calculator, TrendingUp, Wallet, CalendarDays, ArrowRight, BarChart3, Trash2, Clock, Star } from 'lucide-react';
import clsx from 'clsx';

const calcCards = [
  { to: '/kalkulator/penjatahan', icon: Calculator, label: 'Estimasi Penjatahan', desc: 'Hitung estimasi lot IPO', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { to: '/kalkulator/ara-arb', icon: TrendingUp, label: 'Kalkulator ARA & ARB', desc: 'Simulasi batas harga harian', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { to: '/kalkulator/modal', icon: Wallet, label: 'Kalkulator Modal', desc: 'Modal IPO multi akun', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  { to: '/kalkulator/profit', icon: BarChart3, label: 'Kalkulator Profit', desc: 'Estimasi keuntungan IPO', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
];

const typeIcons: Record<string, typeof Calculator> = { penjatahan: Calculator, araarb: TrendingUp, modal: Wallet, profit: BarChart3 };
const typeLabels: Record<string, string> = { penjatahan: 'Penjatahan', araarb: 'ARA/ARB', modal: 'Modal', profit: 'Profit' };

export default function Home() {
  const { summary, loading: ipoLoading } = useIpo();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => { setHistory(getHistory()); setLoading(false); }, 500); return () => clearTimeout(t); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-6 anim-fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
        <p className="text-emerald-100 text-sm font-medium mb-1">Selamat Datang di</p>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-1">IPO Tools</h1>
        <p className="text-emerald-200/70 text-sm font-medium mb-2">by AryDims</p>
        <p className="text-emerald-100/80 text-sm max-w-md">All-in-One IPO Calculator for Indonesian Investors</p>
          <Link to="/ipo-center" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-sm font-semibold transition-colors">
            <CalendarDays className="w-4 h-4" />
            Lihat IPO Center
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Akan Datang', value: summary.upcoming, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Berlangsung', value: summary.ongoing, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Sudah Listing', value: summary.listed, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            {ipoLoading ? <div className="h-7 w-12 skeleton mx-auto mb-1" /> : <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>}
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Kalkulator Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Kalkulator</h2>
        <div className="grid grid-cols-2 gap-3">
          {calcCards.map((c) => (
            <Link key={c.to} to={c.to}>
              <Card className="group h-full">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <c.icon className={`w-5 h-5 bg-gradient-to-br ${c.color} bg-clip-text`} style={{ color: 'var(--tw-gradient-from)' }} />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.label}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{c.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Riwayat */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat</h2>
          </div>
          {history.length > 0 && (
            <button onClick={() => { clearHistory(); setHistory([]); }} className="text-[10px] text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          )}
        </div>
        {loading ? (
          <div className="space-y-2.5">{[...Array(4)].map((_, i) => <div key={i} className="flex gap-3"><div className="w-8 h-8 skeleton rounded-lg flex-shrink-0" /><div className="flex-1 space-y-1.5"><div className="h-3 skeleton w-3/4" /><div className="h-2.5 skeleton w-1/2" /></div></div>)}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-6">
            <Star className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada riwayat perhitungan</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {history.slice(0, 8).map((item) => {
              const Icon = typeIcons[item.type] || Calculator;
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.summary}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(item.date)}</p>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{typeLabels[item.type]}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}