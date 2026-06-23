import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import { fetchIpoById } from '../services/ipoService';
import { isInWatchlist, toggleWatchlist } from '../services/storage';
import { formatRupiah, formatNumber, formatDana, formatDateFull } from '../utils/format';
import type { IpoData } from '../types';
import { ArrowLeft, Heart, ExternalLink, Calculator, TrendingUp, Wallet } from 'lucide-react';
import clsx from 'clsx';

const statusConfig: Record<string, { label: string; cls: string }> = {
  upcoming: { label: 'Akan Datang', cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' },
  ongoing: { label: 'Sedang Berlangsung', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  listed: { label: 'Sudah Listing', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
};

export default function IpoDetail() {
  const { id } = useParams<{ id: string }>();
  const [ipo, setIpo] = useState<IpoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchIpoById(id).then((data) => { setIpo(data); setWatched(data ? isInWatchlist(data.id) : false); setLoading(false); });
  }, [id]);

  const toggleWatch = () => { if (!ipo) return; toggleWatchlist(ipo.id); setWatched(!watched); };

  if (loading) return <div className="max-w-2xl mx-auto space-y-3 p-4">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>;
  if (!ipo) return <div className="max-w-2xl mx-auto p-4 text-center py-20"><p className="text-sm text-slate-500">IPO tidak ditemukan</p></div>;

  const st = statusConfig[ipo.status || 'listed'];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-6 anim-fade-up">
      <Link to="/ipo-center" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke IPO Center
      </Link>

      {/* Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{ipo.ticker}</h1>
              <span className={clsx('text-[10px] font-semibold px-2.5 py-1 rounded-full border', st.cls)}>{st.label}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{ipo.companyName}</p>
          </div>
          <button onClick={toggleWatch} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Heart className={clsx('w-5 h-5 transition-colors', watched ? 'fill-red-500 text-red-500' : 'text-slate-400')} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Harga IPO</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{formatRupiah(ipo.ipoPrice)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Dana Dihimpun</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{formatDana(ipo.fundraising)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Saham Ditawarkan</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatNumber(ipo.sharesOffered)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Sektor</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{ipo.sector}</p>
          </div>
        </div>
      </Card>

      {/* Jadwal */}
      <Card>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Jadwal</h2>
        <div className="space-y-2.5">
          {[
            { label: 'Penawaran', date: ipo.openDate },
            { label: 'Penutupan', date: ipo.closeDate },
            { label: 'Listing', date: ipo.listingDate },
          ].map((j) => (
            <div key={j.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">{j.label}</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{formatDateFull(j.date)}</span>
            </div>
          ))}
        </div>
        {ipo.prospectusUrl !== '#' && (
          <a href={ipo.prospectusUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            <ExternalLink className="w-3.5 h-3.5" /> Buka Prospektus
          </a>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Gunakan di Kalkulator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link to={`/kalkulator/penjatahan?ipo=${ipo.id}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Penjatahan</span>
          </Link>
          <Link to={`/kalkulator/modal?ipo=${ipo.id}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
            <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Modal</span>
          </Link>
          <Link to={`/kalkulator/profit?ipo=${ipo.id}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Profit</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}