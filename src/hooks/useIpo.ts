import { useState, useEffect } from 'react';
import { fetchIpos, filterIpos, getSectors, getYears, getIpoSummary } from '../services/ipoService';
import type { IpoData, IpoFilter } from '../types';

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
    fetchIpos()
      .then((data) => { if (!cancelled) { setIpos(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setFiltered(filterIpos(ipos, filter));
  }, [ipos, filter]);

  const sectors = getSectors(ipos);
  const years = getYears(ipos);
  const summary = getIpoSummary(ipos);

  const retry = () => {
    setLoading(true);
    setError(null);
    fetchIpos().then((data) => { setIpos(data); setLoading(false); }).catch((err) => { setError(err.message); setLoading(false); });
  };

  return { ipos, filtered, loading, error, filter, setFilter, sectors, years, summary, retry };
}