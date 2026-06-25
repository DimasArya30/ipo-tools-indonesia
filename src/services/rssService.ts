import type { NewsItem } from '../types/news';

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';
const FEEDS = [
  'https://news.google.com/rss/search?q=IPO+Indonesia&hl=id&gl=ID&ceid=ID:id',
  'https://news.google.com/rss/search?q=BEI+Pasar+Modal&hl=id&gl=ID&ceid=ID:id',
  'https://news.google.com/rss/search?q=IHSG&hl=id&gl=ID&ceid=ID:id',
];

export const fetchNewsRSS = async (): Promise<NewsItem[]> => {
  const allItems: NewsItem[] = [];
  const seen = new Set<string>();

  for (const url of FEEDS) {
    try {
      const res = await fetch(`${RSS2JSON}${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.status === 'ok' && data.items) {
        for (const item of data.items) {
          if (!seen.has(item.link)) {
            seen.add(item.link);
            allItems.push({
              title: item.title,
              source: data.feed?.title || 'Google News',
              pubDate: item.pubDate,
              author: item.author || '',
              thumbnail: item.thumbnail || '',
              description: item.description || '',
              link: item.link,
            });
          }
        }
      }
    } catch (e) { console.error('RSS Error:', e); }
  }
  
  return allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};