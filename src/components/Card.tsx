import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({ children, className, noPadding }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors',
        !noPadding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}