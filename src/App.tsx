import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import IpoCenter from './pages/IpoCenter';
import IpoDetail from './pages/IpoDetail';
import KalkulatorHub from './pages/KalkulatorHub';
import EstimasiPenjatahan from './pages/EstimasiPenjatahan';
import KalkulatorARAARB from './pages/KalkulatorARAARB';
import KalkulatorModal from './pages/KalkulatorModal';
import KalkulatorProfit from './pages/KalkulatorProfit';
import { TrendingUp } from 'lucide-react';

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1600);
    const t2 = setTimeout(() => onDone(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      {/* Glow */}
      <div className="absolute w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute w-24 h-24 bg-teal-500/15 rounded-full blur-2xl translate-x-10 -translate-y-8" />

      {/* Icon */}
      <div className="relative mb-6 animate-bounce">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Text */}
      <div className="relative text-center">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">IPOHub</h1>
        <p className="text-emerald-400 text-xs font-semibold mt-1 tracking-wide">Smart IPO Calculator</p>
        <p className="text-slate-500 text-[10px] font-medium mt-2">by AryDims</p>
      </div>

      {/* Loader */}
      <div className="relative mt-8 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            style={{
              animation: 'pulse 1s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 px-4 pt-4 pb-20 lg:pb-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ipo-center" element={<IpoCenter />} />
              <Route path="/ipo-center/:id" element={<IpoDetail />} />
              <Route path="/kalkulator" element={<KalkulatorHub />} />
              <Route path="/kalkulator/penjatahan" element={<EstimasiPenjatahan />} />
              <Route path="/kalkulator/ara-arb" element={<KalkulatorARAARB />} />
              <Route path="/kalkulator/modal" element={<KalkulatorModal />} />
              <Route path="/kalkulator/profit" element={<KalkulatorProfit />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return <AppContent />;
}