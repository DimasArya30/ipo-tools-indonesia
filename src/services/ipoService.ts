import type { IpoData, IpoFilter } from '../types';

const CACHE_KEY = 'ipo-cache';
const CACHE_DURATION = 6 * 60 * 60 * 1000;

interface CacheEntry { data: IpoData[]; timestamp: number; }

const MOCK_IPOS: IpoData[] = [
  { id: 'cdia', ticker: 'CDIA', companyName: 'Citra Nusa Informatika Tbk', sector: 'Teknologi Informasi', ipoPrice: 190, sharesOffered: 1105263158, fundraising: 210000000000, openDate: '2025-07-14', closeDate: '2025-07-16', listingDate: '2025-07-21', prospectusUrl: '#' },
  { id: 'brto', ticker: 'BRTO', companyName: 'Bromo Satelit Nusantara Tbk', sector: 'Telekomunikasi', ipoPrice: 310, sharesOffered: 2000000000, fundraising: 620000000000, openDate: '2025-07-10', closeDate: '2025-07-15', listingDate: '2025-07-22', prospectusUrl: '#' },
  { id: 'mtka', ticker: 'MTKA', companyName: 'Mata Karya Anugerah Tbk', sector: 'Konstruksi', ipoPrice: 250, sharesOffered: 800000000, fundraising: 200000000000, openDate: '2025-08-01', closeDate: '2025-08-05', listingDate: '2025-08-11', prospectusUrl: '#' },
  { id: 'sgrp', ticker: 'SGRP', companyName: 'Sinar Group Properti Tbk', sector: 'Properti', ipoPrice: 510, sharesOffered: 1500000000, fundraising: 765000000000, openDate: '2025-08-10', closeDate: '2025-08-14', listingDate: '2025-08-20', prospectusUrl: '#' },
  { id: 'nxtl', ticker: 'NXTL', companyName: 'Nexa Tech Logistics Tbk', sector: 'Logistik', ipoPrice: 155, sharesOffered: 3200000000, fundraising: 496000000000, openDate: '2025-08-20', closeDate: '2025-08-22', listingDate: '2025-08-27', prospectusUrl: '#' },
  { id: 'prdi', ticker: 'PRDI', companyName: 'Pradaxa Energi Tbk', sector: 'Energi', ipoPrice: 120, sharesOffered: 2500000000, fundraising: 300000000000, openDate: '2025-03-10', closeDate: '2025-03-12', listingDate: '2025-03-17', prospectusUrl: '#' },
  { id: 'rans', ticker: 'RANS', companyName: 'Rans Energi Indonesia Tbk', sector: 'Energi', ipoPrice: 170, sharesOffered: 3000000000, fundraising: 510000000000, openDate: '2025-02-05', closeDate: '2025-02-07', listingDate: '2025-02-12', prospectusUrl: '#' },
  { id: 'bull', ticker: 'BULL', companyName: 'Bullion Sekuritas Digital Tbk', sector: 'Finansial', ipoPrice: 230, sharesOffered: 1800000000, fundraising: 414000000000, openDate: '2025-01-15', closeDate: '2025-01-17', listingDate: '2025-01-22', prospectusUrl: '#' },
  { id: 'humi', ticker: 'HUMI', companyName: 'Humanika Inovasi Teknologi Tbk', sector: 'Teknologi Informasi', ipoPrice: 280, sharesOffered: 600000000, fundraising: 168000000000, openDate: '2025-04-07', closeDate: '2025-04-09', listingDate: '2025-04-14', prospectusUrl: '#' },
  { id: 'agro', ticker: 'AGRO', companyName: 'Agro Mandiri Sejahtera Tbk', sector: 'Pertanian', ipoPrice: 105, sharesOffered: 4500000000, fundraising: 472500000000, openDate: '2025-01-20', closeDate: '2025-01-22', listingDate: '2025-01-27', prospectusUrl: '#' },
  { id: 'medi', ticker: 'MEDI', companyName: 'Medika Prima Health Tbk', sector: 'Kesehatan', ipoPrice: 420, sharesOffered: 900000000, fundraising: 378000000000, openDate: '2025-05-05', closeDate: '2025-05-07', listingDate: '2025-05-12', prospectusUrl: '#' },
  { id: 'food', ticker: 'FOOD', companyName: 'Food Nova Indonesia Tbk', sector: 'Konsumer', ipoPrice: 88, sharesOffered: 6000000000, fundraising: 528000000000, openDate: '2024-11-10', closeDate: '2024-11-12', listingDate: '2024-11-18', prospectusUrl: '#' },
  { id: 'mine', ticker: 'MINE', companyName: 'Mineral Resource Indonesia Tbk', sector: 'Pertambangan', ipoPrice: 350, sharesOffered: 1200000000, fundraising: 420000000000, openDate: '2024-10-08', closeDate: '2024-10-10', listingDate: '2024-10-15', prospectusUrl: '#' },
  { id: 'text', ticker: 'TEXT', companyName: 'Textile Garment Nusantara Tbk', sector: 'Industri', ipoPrice: 198, sharesOffered: 2200000000, fundraising: 435600000000, openDate: '2024-09-12', closeDate: '2024-09-16', listingDate: '2024-09-22', prospectusUrl: '#' },
  { id: 'solar', ticker: 'SOLAR', companyName: 'Solar Energi Nusantara Tbk', sector: 'Energi Terbarukan', ipoPrice: 265, sharesOffered: 1700000000, fundraising: 450500000000, openDate: '2024-08-05', closeDate: '2024-08-07', listingDate: '2024-08-12', prospectusUrl: '#' },
  { id: 'bank', ticker: 'BANK', companyName: 'Bank Digital Sejahtera Tbk', sector: 'Finansial', ipoPrice: 500, sharesOffered: 1000000000, fundraising: 500000000000, openDate: '2024-07-10', closeDate: '2024-07-12', listingDate: '2024-07-17', prospectusUrl: '#' },
];

function computeStatus(ipo: IpoData): 'upcoming' | 'ongoing' | 'listed' {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const open = new Date(ipo.openDate); open.setHours(0, 0, 0, 0);
  const close = new Date(ipo.closeDate); close.setHours(0, 0, 0, 0);
  const listing = new Date(ipo.listingDate); listing.setHours(0, 0, 0, 0);
  if (now < open) return 'upcoming';
  if (now <= close) return 'ongoing';
  if (now >= listing) return 'listed';
  return 'listed';
}

function applyStatuses(data: IpoData[]): IpoData[] {
  return data.map((d) => ({ ...d, status: computeStatus(d) }));
}

function getFromCache(): IpoData[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_DURATION) return null;
    return applyStatuses(entry.data);
  } catch { return null; }
}

function saveToCache(data: IpoData[]): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
}

async function fetchFromApi(): Promise<IpoData[]> {
  // Ganti dengan API sungguhan di masa depan
  // const res = await fetch('https://api.example.com/ipos');
  // return res.json();
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_IPOS), 400));
}

export async function fetchIpos(): Promise<IpoData[]> {
  const cached = getFromCache();
  if (cached) return cached;
  const data = await fetchFromApi();
  saveToCache(data);
  return applyStatuses(data);
}

export async function fetchIpoById(id: string): Promise<IpoData | null> {
  const all = await fetchIpos();
  return all.find((i) => i.id === id) || null;
}

export function filterIpos(ipos: IpoData[], filter: IpoFilter): IpoData[] {
  return ipos.filter((ipo) => {
    if (filter.status !== 'all' && ipo.status !== filter.status) return false;
    if (filter.sector && ipo.sector !== filter.sector) return false;
    if (filter.year) {
      const y = new Date(ipo.openDate).getFullYear().toString();
      if (y !== filter.year) return false;
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!ipo.ticker.toLowerCase().includes(q) && !ipo.companyName.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function getSectors(ipos: IpoData[]): string[] {
  return [...new Set(ipos.map((i) => i.sector))].sort();
}

export function getYears(ipos: IpoData[]): string[] {
  return [...new Set(ipos.map((i) => new Date(i.openDate).getFullYear().toString()))].sort().reverse();
}

export function getIpoSummary(ipos: IpoData[]) {
  return {
    upcoming: ipos.filter((i) => i.status === 'upcoming').length,
    ongoing: ipos.filter((i) => i.status === 'ongoing').length,
    listed: ipos.filter((i) => i.status === 'listed').length,
  };
}