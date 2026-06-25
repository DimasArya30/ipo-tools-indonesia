import { useState, useEffect, useCallback } from 'react';
import type { NewsItem, NewsCategory } from '../types/news';
import { fetchNewsRSS } from '../services/rssService';
import { enrichNewsWithAI } from '../services/geminiNewsService';
import { getCache, setCache } from '../services/cacheService'; // Fix path

const CACHE_KEY = 'news_main_list';
const CACHE_TTL = 15 * 60 * 1000;

export const useNews = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NewsCategory | 'All'>('All');
  const [search, setSearch] = useState('');

  const loadNews = async () => {
    setLoading(true);
    let data = getCache<NewsItem[]>(CACHE_KEY);
    if (!data) {
      data = await fetchNewsRSS();
      setCache(CACHE_KEY, data, CACHE_TTL);
    }
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadNews(); }, []);

  // Lazy AI enrichment for visible items
  useEffect(() => {
    if (items.length === 0) return;
    const processAI = async () => {
      const updated = [...items];
      for (let i = 0; i < Math.min(10, updated.length); i++) {
        if (!updated[i].summary) {
          const ai = await enrichNewsWithAI(updated[i]);
          updated[i] = { ...updated[i], ...ai };
          setItems([...updated]);
        }
      }
    };
    processAI();
  }, [items.length > 0]);

  const filtered = items.filter(item => {
    const matchCat = filter === 'All' || item.category === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || (item.affectedStocks || []).some(s => s.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return { items: filtered, loading, filter, setFilter, search, setSearch };
};