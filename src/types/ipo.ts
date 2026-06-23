export interface IpoData {
  id: string;
  ticker: string;
  companyName: string;
  sector: string;
  ipoPrice: number;
  sharesOffered: number;
  fundraising: number;
  openDate: string;
  closeDate: string;
  listingDate: string;
  prospectusUrl: string;
  status?: 'upcoming' | 'ongoing' | 'listed';
}

export interface IpoFilter {
  search: string;
  status: 'all' | 'upcoming' | 'ongoing' | 'listed';
  sector: string;
  year: string;
}