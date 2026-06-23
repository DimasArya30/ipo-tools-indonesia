import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { getHistory, clearHistory } from '../services/storage';
import { formatDate } from '../utils/format';
import type { HistoryItem } from '../types';
import { Calculator, TrendingUp, Wallet, Trash2, ArrowRight, BarChart3 } from 'lucide-react';

const typeLabels: Record<string, string> = {
  penjatahan: 'Estimasi Penjatahan',
  araarb: 'ARA & ARB',
  modal: 'Modal Multi Akun',
};

const typeColors: Record<string, string> = {
  penjatahan: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  araarb: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  modal: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const typeIcons: Record<string, typeof Calculator> = {
  penjatahan: Calculator,
  araarb: TrendingUp,
  modal: Wallet,
};

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(getHistory());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  const stats = [
    {
      label: 'Total Simulasi',
      value: loading ? '—' : history.length.toString(),
      icon: BarChart3,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Estimasi Penjatahan',
      value: loading ? '—' : history.filter((h) => h.type === 'penjatahan').length.toString(),
      icon: Calculator,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Kalkulator ARA/ARB',
      value: loading ? '—' : history.filter((h) => h.type === 'araarb').length.toString(),
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Kalkulator Modal',
      value: loading ? '—' : history.filter((h) => h.type === 'modal').length.toString(),
      icon: Wallet,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ringkasan aktivitas kalkulator IPO Anda
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-bl-[40px]`} />
            <s.icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse-subtle" />
              ) : (
                s.value
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <Link to="/penjatahan">
          <Card className="group hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Estimasi Penjatahan</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hitung estimasi lot IPO</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          </Card>
        </Link>
        <Link to="/ara-arb">
          <Card className="group hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Kalkulator ARA & ARB</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Simulasi batas harga harian</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
          </Card>
        </Link>
        <Link to="/modal">
          <Card className="group hover:border-amber-300 dark:hover:border-amber-700 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Kalkulator Modal</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hitung modal multi akun IPO</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Riwayat Perhitungan</h2>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Hapus Semua
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse-subtle" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse-subtle" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse-subtle" />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10">
            <BarChart3 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat perhitungan</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Mulai gunakan kalkulator untuk melihat riwayat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 20).map((item) => {
              const Icon = typeIcons[item.type] || Calculator;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[item.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.summary}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(item.date)}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {typeLabels[item.type]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}