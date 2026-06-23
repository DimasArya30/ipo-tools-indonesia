import type { ReactNode } from 'react';
import clsx from 'clsx';

export default function Card({ children, className, noPadding, onClick }: { children: ReactNode; className?: string; noPadding?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={clsx('bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm shadow-slate-200/40 dark:shadow-none transition-all', !noPadding && 'p-5', onClick && 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700', className)}>
      {children}
    </div>
  );
}