import type { HistoryItem } from '../types';

const HISTORY_KEY = 'ipo-tools-history';
const WATCHLIST_KEY = 'ipo-watchlist';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/* ---- History ---- */
export function getHistory(): HistoryItem[] {
  try { const r = localStorage.getItem(HISTORY_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export function addHistory(type: HistoryItem['type'], summary: string): void {
  const h = getHistory();
  h.unshift({ id: genId(), type, date: new Date().toISOString(), summary });
  if (h.length > 50) h.length = 50;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}
export function clearHistory(): void { localStorage.removeItem(HISTORY_KEY); }

/* ---- Watchlist ---- */
export function getWatchlist(): string[] {
  try { const r = localStorage.getItem(WATCHLIST_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
export function toggleWatchlist(id: string): boolean {
  const w = getWatchlist();
  const idx = w.indexOf(id);
  if (idx >= 0) { w.splice(idx, 1); } else { w.push(id); }
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(w));
  return idx < 0;
}
export function isInWatchlist(id: string): boolean { return getWatchlist().includes(id); }

/* ---- Theme ---- */
export function getTheme(): string { return localStorage.getItem('ipo-theme') || 'light'; }
export function setTheme(t: string): void {
  localStorage.setItem('ipo-theme', t);
  document.documentElement.classList.toggle('dark', t === 'dark');
}
export function toggleTheme(): string { const n = getTheme() === 'dark' ? 'light' : 'dark'; setTheme(n); return n; }