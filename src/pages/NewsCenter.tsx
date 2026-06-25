import Card from '../components/Card';
import { useNews } from '../hooks/useNews';
import { Newspaper, Search, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import type { NewsCategory } from '../types/news';

const CATEGORIES: (NewsCategory | 'All')[] = ['All', 'IPO', 'BEI', 'IHSG', 'Dividen', 'Rights Issue', 'Buyback', 'Emiten'];

const SentimentIcon = ({ s }: { s?: string }) => {
  if (s === 'Bullish') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (s === 'Bearish') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

export default function NewsCenter() {
  const { items, loading, filter, setFilter, search, setSearch } = useNews();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Newspaper className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IPO News Center</h1>
          <p className="text-sm text-gray-500">Berita terbaru pasar modal Indonesia</p>
        </div>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari berita atau ticker..." className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === c ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Memuat berita...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Tidak ada berita ditemukan.</div>
          ) : (
            items.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {item.thumbnail && <img src={item.thumbnail} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 hidden sm:block" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
                    <SentimentIcon s={item.sentiment} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary || item.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.pubDate).toLocaleDateString('id-ID')}</span>
                    {item.category && <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full">{item.category}</span>}
                    {item.affectedStocks?.map(s => <span key={s} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full font-mono">{s}</span>)}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
              </a>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}