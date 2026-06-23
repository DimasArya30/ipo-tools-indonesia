import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import IpoCard from '../components/IpoCard';
import { useIpo } from '../hooks/useIpo';
import { Search, SlidersHorizontal, CalendarDays, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

const tabs = [
  { key: 'all' as const, label: 'Semua' },
  { key: 'upcoming' as const, label: 'Akan Datang' },
  { key: 'ongoing' as const, label: 'Berlangsung' },
  { key: 'listed' as const, label: 'Sudah Listing' },
];

export default function IpoCenter() {
  const { filtered, loading, error, filter, setFilter, sectors, years, retry } = useIpo();
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [watchKey, setWatchKey] = useState(0);

  const activeTab = filter.status === 'all' ? 'all' : filter.status;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-6 anim-fade-up">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">IPO Center</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Data IPO Indonesia terkini</p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input type="text" value={filter.search} onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))} placeholder="Cari ticker atau nama emiten..." className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none" />
        </div>
        <button onClick={() => setShowFilter(!showFilter)} className={clsx('w-10 h-10 rounded-xl border flex items-center justify-center transition-colors', showFilter ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500')}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <Card className="anim-fade-up">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Sektor</label>
              <select value={filter.sector} onChange={(e) => setFilter((f) => ({ ...f, sector: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none">
                <option value="">Semua Sektor</option>
                {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Tahun</label>
              <select value={filter.year} onChange={(e) => setFilter((f) => ({ ...f, year: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none">
                <option value="">Semua Tahun</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setFilter((f) => ({ ...f, status: t.key }))} className={clsx('px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors', activeTab === t.key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <Card className="text-center py-10">
          <p className="text-sm text-red-500 mb-3">Gagal memuat data: {error}</p>
          <button onClick={retry} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium"><RefreshCw className="w-4 h-4" /> Coba Lagi</button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4">
              <div className="flex gap-2 mb-3"><div className="h-5 w-16 skeleton" /><div className="h-5 w-20 skeleton" /></div>
              <div className="h-3 w-48 skeleton mb-3" />
              <div className="grid grid-cols-2 gap-2"><div className="h-12 skeleton rounded-xl" /><div className="h-12 skeleton rounded-xl" /></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-10">
          <CalendarDays className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada IPO ditemukan</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((ipo) => (
            <IpoCard key={ipo.id} ipo={ipo} onClick={() => navigate(`/ipo-center/${ipo.id}`)} onWatchToggle={() => setWatchKey((k) => k + 1)} />
          ))}
        </div>
      )}
    </div>
  );
}