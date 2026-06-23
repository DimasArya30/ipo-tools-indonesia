import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, TrendingUp, Wallet, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { getTheme, toggleTheme } from '../services/storage';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/penjatahan', icon: Calculator, label: 'Estimasi Penjatahan' },
  { to: '/ara-arb', icon: TrendingUp, label: 'Kalkulator ARA & ARB' },
  { to: '/modal', icon: Wallet, label: 'Kalkulator Modal' },
];

export default function Sidebar() {
  const [dark, setDark] = useState(getTheme() === 'dark');

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setDark(next === 'dark');
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">IPO Tools</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Indonesia</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleToggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 w-full transition-colors"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{dark ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>
      </div>
    </aside>
  );
}