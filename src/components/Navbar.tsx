import { Moon, Sun, TrendingUp } from 'lucide-react';
import { getTheme, toggleTheme } from '../services/storage';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [dark, setDark] = useState(getTheme() === 'dark');
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);

  const handleToggle = () => { const n = toggleTheme(); setDark(n === 'dark'); };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">IPO Tools</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Indonesia</p>
          </div>
        </div>
        <button onClick={handleToggle} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}