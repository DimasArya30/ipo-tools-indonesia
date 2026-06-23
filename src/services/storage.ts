import type { HistoryItem } from '../types';

const HISTORY_KEY = 'ipo-tools-history';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(type: HistoryItem['type'], summary: string): void {
  const history = getHistory();
  history.unshift({
    id: genId(),
    type,
    date: new Date().toISOString(),
    summary,
  });
  if (history.length > 50) history.length = 50;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getTheme(): string {
  return localStorage.getItem('ipo-theme') || 'light';
}

export function setTheme(theme: string): void {
  localStorage.setItem('ipo-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme(): string {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}