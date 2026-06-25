import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { Calculator, TrendingUp, Wallet, BarChart3, Coins, ArrowRight } from 'lucide-react';

const items = [
  { to: '/kalkulator/penjatahan', icon: Calculator, title: 'Estimasi Penjatahan IPO', desc: 'Estimasi jumlah lot yang diperoleh saat IPO berdasarkan dana dihimpun, oversubscribe, dan antrian investor.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { to: '/kalkulator/ara-arb', icon: TrendingUp, title: 'Kalkulator ARA & ARB', desc: 'Simulasi batas Auto Rejection Atas dan Bawah harian dengan fraksi harga BEI, untuk saham Reguler dan FCA.', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { to: '/dividend-calculator', icon: Coins, title: 'Dividend Calculator', desc: 'Hitung dividen kotor, bersih, pajak, yield, yield on cost, dan proyeksi reinvestasi dividen.', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
  { to: '/kalkulator/modal', icon: Wallet, title: 'Kalkulator Modal Multi Akun', desc: 'Hitung kebutuhan modal IPO untuk banyak akun sekaligus. Tambah saham sebanyak yang diinginkan.', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  { to: '/kalkulator/profit', icon: BarChart3, title: 'Kalkulator Profit IPO', desc: 'Estimasi keuntungan dari investasi IPO berdasarkan harga beli dan harga jual target.', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
];

export default function KalkulatorHub() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-6 anim-fade-up">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Kalkulator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih kalkulator yang ingin digunakan</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}