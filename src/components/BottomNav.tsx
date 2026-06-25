import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, Calculator, Brain, Newspaper } from 'lucide-react';
import clsx from 'clsx';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/ipo-center', icon: CalendarDays, label: 'IPO' },
  { to: '/ai-ipo-score', icon: Brain, label: 'AI Score' },
  { to: '/news-center', icon: Newspaper, label: 'News' },
  { to: '/kalkulator', icon: Calculator, label: 'Kalkulator' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 safe-area-bottom">
      <div className="max-w-5xl mx-auto flex items-center justify-around h-16">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => clsx('flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500')}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}