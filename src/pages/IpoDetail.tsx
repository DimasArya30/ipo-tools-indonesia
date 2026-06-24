import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import { getIPOByTicker, getMappedStatus } from '../services/ipoService';
import { isInWatchlist, toggleWatchlist } from '../services/storage';
import { formatRupiah, formatNumber, formatDateFull, formatDecimal } from '../utils/format';
import type { IpoData, IpoStatusFilter } from '../types';
import { ArrowLeft, Heart, ExternalLink, Calculator, TrendingUp, Wallet, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

const statusCfg: Record<IpoStatusFilter, { label: string; cls: string }> = {
  ongoing: { label: 'Sedang Berlangsung', cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' },
  listed: { label: 'Sudah Listing', cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  postponed: { label: 'Ditunda', cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  all: { label: '', cls: '' },
};

const returnKeys = ['returnD1', 'returnD2', 'returnD3', 'returnD4', 'returnD5', 'returnD6', 'returnD7'] as const;

function fmtReturn(v: number | null): { text: string; color: string } {
  if (v === null || v === undefined) return { text: '-', color: 'text-slate-400' };
  const pct = v * 100;
  return { text: (pct >= 0 ? '+' : '') + formatDecimal(pct) + '%', color: pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' };
}

export default function IpoDetail() {
  const { id } = useParams<{ id: string }>();
  const [ipo, setIpo] = useState<IpoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getIPOByTicker(id).then((d) => { setIpo(d); setWatched(d ? isInWatchlist(d.tickerCode) : false); setLoading(false); });
  }, [id]);

  const toggleWatch = () => { if (!ipo) return; toggleWatchlist(ipo.tickerCode); setWatched(!watched); };

  if (loading) return <div className="max-w-2xl mx-auto space-y-3 p-4">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>;
  if (!ipo) return <div className="max-w-2xl mx-auto p-4 text-center py-20"><p className="text-sm text-slate-500">IPO tidak ditemukan</p></div>;

  const st = statusCfg[getMappedStatus(ipo.ipoStatus)];
  const danaDihimpun = ipo.finalPrice * ipo.sharesOffered;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-6 anim-fade-up">
      <Link to="/ipo-center" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke IPO Center
      </Link>

      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{ipo.tickerCode}</h1>
              {st.label && <span className={clsx('text-[10px] font-semibold px-2.5 py-1 rounded-full border', st.cls)}>{st.label}</span>}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{ipo.companyName}</p>
          </div>
          <button onClick={toggleWatch} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Heart className={clsx('w-5 h-5 transition-colors', watched ? 'fill-red-500 text-red-500' : 'text-slate-400')} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Harga IPO', val: ipo.finalPrice > 0 ? formatRupiah(ipo.finalPrice) : '-' },
            { label: 'Dana Dihimpun', val: danaDihimpun > 0 ? formatRupiah(danaDihimpun) : '-' },
            { label: 'Saham Ditawarkan', val: ipo.sharesOffered > 0 ? formatNumber(ipo.sharesOffered) : '-' },
            { label: '% Saham Ditawarkan', val: ipo.offeringPercentage > 0 ? formatDecimal(ipo.offeringPercentage) + '%' : '-' },
            { label: 'Sektor', val: ipo.sector || '-' },
            { label: 'Subsektor', val: ipo.subsector || '-' },
            { label: 'Board', val: ipo.listingBoard || '-' },
            { label: 'Underwriter', val: ipo.underwriters || '-' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.label}</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 break-words">{item.val}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Jadwal</h2>
        <div className="space-y-0">
          {[
            { label: 'Book Building Opening', date: ipo.bookBuildingOpening },
            { label: 'Book Building Closing', date: ipo.bookBuildingClosing },
            { label: 'Opening of Offering', date: ipo.offeringOpening },
            { label: 'Closing of Offering', date: ipo.offeringClosing },
            { label: 'Closing Date', date: ipo.closingDate },
            { label: 'Distribution Date', date: ipo.distributionDate },
            { label: 'Listing Date', date: ipo.listingDate },
          ].map((j, i) => (
            <div key={j.label} className={clsx('flex items-center justify-between py-2.5', i < 6 && 'border-b border-slate-100 dark:border-slate-800')}>
              <span className="text-xs text-slate-500 dark:text-slate-400">{j.label}</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{j.date ? formatDateFull(j.date) : '-'}</span>
            </div>
          ))}
        </div>
        {ipo.website && ipo.website !== '' && ipo.website !== '-' && (
          <a href={ipo.website.startsWith('http') ? ipo.website : `https://${ipo.website}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
            <ExternalLink className="w-3.5 h-3.5" /> {ipo.website}
          </a>
        )}
      </Card>

      {ipo.lineOfBusiness && (
        <Card>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Deskripsi Usaha</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ipo.lineOfBusiness}</p>
        </Card>
      )}

      {(ipo.returnD1 !== null || ipo.returnFromListing !== null) && (
        <Card>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">📈 Performa Setelah IPO</h2>
          <div className="grid grid-cols-4 gap-2">
            {returnKeys.map((key) => {
              const v = ipo[key];
              const fmt = fmtReturn(v);
              return (
                <div key={key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{key.replace('return', 'D')}</p>
                  <p className={clsx('text-sm font-extrabold mt-0.5', fmt.color)}>{fmt.text}</p>
                </div>
              );
            })}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center col-span-4">
              <p className="text-[10px] text-emerald-500 font-bold uppercase">Return Total</p>
              <p className={clsx('text-lg font-extrabold', fmtReturn(ipo.returnFromListing).color)}>{fmtReturn(ipo.returnFromListing).text}</p>
            </div>
          </div>
        </Card>
      )}

      {ipo.finalPrice > 0 && (
        <Card>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Gunakan di Kalkulator</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { to: `/kalkulator/penjatahan?ipo=${ipo.tickerCode}`, icon: Calculator, title: 'Penjatahan', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
              { to: `/kalkulator/modal?ipo=${ipo.tickerCode}`, icon: Wallet, title: 'Modal', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
              { to: `/kalkulator/profit?ipo=${ipo.tickerCode}`, icon: BarChart3, title: 'Profit', color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className={`flex items-center gap-2.5 p-3 rounded-xl ${item.color} hover:opacity-80 transition-opacity`}>
                <item.icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{item.title}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}