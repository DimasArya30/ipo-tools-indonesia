import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { Moon, Sun } from 'lucide-react';
import { getTheme, toggleTheme } from '../services/storage';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [dark, setDark] = useState(getTheme() === 'dark');

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleToggle = () => {
    const next = toggleTheme();
    setDark(next === 'dark');
  };

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white lg:hidden">
            IPO Tools Indonesia
          </h2>
          <div className="hidden lg:block" />
          <button
            onClick={handleToggle}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}