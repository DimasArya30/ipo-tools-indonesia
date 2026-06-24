import { useState, useEffect } from 'react';
import { getAllIPO, filterIpos, getSectors, getYears, getSummary } from '../services/ipoService';
import type { IpoData, IpoFilter, IpoStatusFilter } from '../types';

export function useIpo(initialFilter?: Partial<IpoFilter>) {
  const [ipos, setIpos] = useState<IpoData[]>([]);
  const [filtered, setFiltered] = useState<IpoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<IpoFilter>({
    search: '',
    status: 'all',
    sector: '',
    year: '',
    ...initialFilter,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllIPO()
      .then((data) => { if (!cancelled) { setIpos(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { setFiltered(filterIpos(ipos, filter)); }, [ipos, filter]);

  const sectors = getSectors(ipos);
  const years = getYears(ipos);
  const summary = getSummary(ipos);
  const retry = () => { setLoading(true); setError(null); getAllIPO().then((d) => { setIpos(d); setLoading(false); }).catch((e) => { setError(e.message); setLoading(false); }); };

  return { ipos, filtered, loading, error, filter, setFilter, sectors, years, summary, retry };
}