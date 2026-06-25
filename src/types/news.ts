export type NewsCategory = 'IPO' | 'BEI' | 'IHSG' | 'Dividen' | 'Rights Issue' | 'Buyback' | 'Emiten';
export type Sentiment = 'Bullish' | 'Bearish' | 'Neutral';

export interface NewsItem {
  title: string;
  source: string;
  pubDate: string;
  author: string;
  thumbnail: string;
  description: string;
  link: string;
  summary?: string;
  sentiment?: Sentiment;
  impact?: 'High' | 'Medium' | 'Low';
  confidence?: number;
  category?: NewsCategory;
  affectedStocks?: string[];
}

export interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
}