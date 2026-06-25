import Papa from 'papaparse';
import type { IpoData, IpoFilter, IpoStatusFilter } from '../types';

const CACHE_KEY = 'ipo-csv-cache';
const CACHE_TTL = 6 * 60 * 60 * 1000;

const STATUS_MAP: Record<string, IpoStatusFilter> = {
  'Waiting For Offering': 'ongoing',
  'Closed': 'listed',
  'Postpone': 'postponed',
};

function parseNum(v: string | number | undefined | null): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

function parseNumNull(v: string | number | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

function mapRow(raw: Record<string, string>, idx: number): IpoData {
  return {
    _row: idx,
    ipoStatus: raw['IPO Status'] || '',
    tickerCode: (raw['Ticker Code'] || '').trim(),
    companyName: (raw['Company Name'] || '').trim(),
    sector: (raw['Sector'] || '').trim(),
    subsector: (raw['Subsector'] || '').trim(),
    listingBoard: (raw['Listing Board'] || '').trim(),
    finalPrice: parseNum(raw['Final Price (Rp)']),
    returnD1: parseNumNull(raw['Return D1']),
    returnD2: parseNumNull(raw['Return D2']),
    returnD3: parseNumNull(raw['Return D3']),
    returnD4: parseNumNull(raw['Return D4']),
    returnD5: parseNumNull(raw['Return D5']),
    returnD6: parseNumNull(raw['Return D6']),
    returnD7: parseNumNull(raw['Return D7']),
    returnFromListing: parseNumNull(raw['Return from Listing Date']),
    lineOfBusiness: (raw['Line of Business'] || '').trim(),
    address: (raw['Address'] || '').trim(),
    website: (raw['Website'] || '').trim(),
    sharesOffered: parseNum(raw['Number of shares offered']),
    offeringPercentage: parseNum(raw['% of Total Shares']),
    participantAdmin: (raw['Participant Admin'] || '').trim(),
    underwriters: (raw['Underwriter(s)'] || '').trim(),
    bookBuildingOpening: (raw['Book Building Opening'] || '').trim(),
    bookBuildingClosing: (raw['Book Building Closing'] || '').trim(),
    lowestBBPrice: parseNum(raw['Lowest Book Building Price (Rp)']),
    highestBBPrice: parseNum(raw['Highest Book Building Price (Rp)']),
    offeringOpening: (raw['Opening of Offering Period'] || '').trim(),
    offeringClosing: (raw['Closing of Offering Period'] || '').trim(),
    closingDate: (raw['Closing Date'] || '').trim(),
    distributionDate: (raw['Distribution Date'] || '').trim(),
    listingDate: (raw['Listing Date'] || '').trim(),
    warrantRatio: parseNum(raw['Warrant per share ratio']),
    exercisePrice: parseNum(raw['Exercise Price (Warrant) (Rp)']),
  };
}

function getCache(): IpoData[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function setCache(data: IpoData[]): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data: data, ts: Date.now() }));
}

async function fetchAndParse(): Promise<IpoData[]> {
  const res = await fetch(encodeURI(`/e-IPO Data.csv?t=${Date.now()}`));
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data.map((row, idx) => mapRow(row as Record<string, string>, idx)).filter((d) => d.tickerCode);
        resolve(data);
      },
      error: (err: unknown) => reject(err),
    });
  });
}

export async function getAllIPO(): Promise<IpoData[]> {
  const cached = getCache();
  if (cached) return cached;
  const data = await fetchAndParse();
  setCache(data);
  return data;
}

export async function getIPOByTicker(ticker: string): Promise<IpoData | null> {
  const all = await getAllIPO();
  return all.find((d) => d.tickerCode.toUpperCase() === ticker.toUpperCase()) || null;
}

export function getMappedStatus(ipoStatus: string): IpoStatusFilter {
  return STATUS_MAP[ipoStatus] || 'listed';
}

export function filterIpos(ipos: IpoData[], filter: IpoFilter): IpoData[] {
  return ipos.filter((ipo) => {
    if (filter.status !== 'all' && getMappedStatus(ipo.ipoStatus) !== filter.status) return false;
    if (filter.sector && ipo.sector !== filter.sector) return false;
    if (filter.year && ipo.listingDate) {
      const y = new Date(ipo.listingDate).getFullYear().toString();
      if (y !== filter.year) return false;
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!ipo.tickerCode.toLowerCase().includes(q) && !ipo.companyName.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function getSectors(ipos: IpoData[]): string[] {
  return [...new Set(ipos.map((i) => i.sector).filter(Boolean))].sort();
}

export function getYears(ipos: IpoData[]): string[] {
  return [...new Set(ipos.map((i) => i.listingDate ? new Date(i.listingDate).getFullYear().toString() : '').filter(Boolean))].sort().reverse();
}

export function getSummary(ipos: IpoData[]) {
  return {
    total: ipos.length,
    listed: ipos.filter((i) => getMappedStatus(i.ipoStatus) === 'listed').length,
    ongoing: ipos.filter((i) => getMappedStatus(i.ipoStatus) === 'ongoing').length,
    postponed: ipos.filter((i) => getMappedStatus(i.ipoStatus) === 'postponed').length,
  };
}