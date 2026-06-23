import type { IpoData } from '../types';
import { formatRupiah, formatDana, formatDate } from '../utils/format';
import { isInWatchlist, toggleWatchlist } from '../services/storage';
import { Heart } from 'lucide-react';
import clsx from 'clsx';

const statusConfig: Record<string, { label: string; cls: string }> = {
  upcoming: { label: 'Akan Datang', cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  ongoing: { label: 'Berlangsung', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  listed: { label: 'Sudah Listing', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
};

export default function IpoCard({ ipo, onClick, onWatchToggle }: { ipo: IpoData; onClick?: () => void; onWatchToggle?: () => void }) {
  const st = statusConfig[ipo.status || 'listed'];
  const watched = isInWatchlist(ipo.id);

  const handleHeart = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(ipo.id);
    onWatchToggle?.();
  };

  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{ipo.ticker}</h3>
            <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', st.cls)}>{st.label}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{ipo.companyName}</p>
        </div>
        <button onClick={handleHeart} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Heart className={clsx('w-4 h-4 transition-colors', watched ? 'fill-red-500 text-red-500' : 'text-slate-300 dark:text-slate-600')} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Harga IPO</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatRupiah(ipo.ipoPrice)}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Dana Dihimpun</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDana(ipo.fundraising)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{ipo.sector}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">Listing: {formatDate(ipo.listingDate)}</span>
      </div>
    </div>
  );
}