import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { getAllIPO } from '../services/ipoService';
import type { IpoData } from '../types';

export default function IpoSelect({ value, onChange, placeholder = 'Pilih IPO...' }: { value: string; onChange: (ipo: IpoData | null) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [ipos, setIpos] = useState<IpoData[]>([]);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = ipos.find((i) => i.tickerCode === value);

  useEffect(() => { getAllIPO().then(setIpos); }, []);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);

  const filtered = ipos.filter((i) => { if (!search) return true; const q = search.toLowerCase(); return i.tickerCode.toLowerCase().includes(q) || i.companyName.toLowerCase().includes(q); });

  const handleSelect = (ipo: IpoData) => { onChange(ipo); setOpen(false); setSearch(''); };
  const handleClear = () => { onChange(null); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
        {selected ? <span className="font-medium text-slate-900 dark:text-white">{selected.tickerCode} — {selected.companyName}</span> : <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>}
        <div className="flex items-center gap-1">
          {selected && <button type="button" onClick={(e) => { e.stopPropagation(); handleClear(); }} className="text-slate-400 hover:text-red-500 text-xs mr-1">✕</button>}
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden anim-fade-up">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari ticker atau nama..." className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none" autoFocus />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? <p className="p-3 text-xs text-slate-400 text-center">Tidak ditemukan</p> : filtered.map((ipo) => (
              <button key={ipo._row} type="button" onClick={() => handleSelect(ipo)} className={`w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${ipo.tickerCode === value ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                <span className="font-semibold">{ipo.tickerCode}</span>
                <span className="text-slate-400 dark:text-slate-500 mx-1.5">—</span>
                <span className="text-xs truncate">{ipo.companyName}</span>
                {ipo.finalPrice > 0 && <span className="float-right text-xs text-slate-400">Rp{ipo.finalPrice.toLocaleString('id-ID')}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}