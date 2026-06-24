export interface IpoData {
  _row: number;
  ipoStatus: string;
  tickerCode: string;
  companyName: string;
  sector: string;
  subsector: string;
  listingBoard: string;
  finalPrice: number;
  returnD1: number | null;
  returnD2: number | null;
  returnD3: number | null;
  returnD4: number | null;
  returnD5: number | null;
  returnD6: number | null;
  returnD7: number | null;
  returnFromListing: number | null;
  lineOfBusiness: string;
  address: string;
  website: string;
  sharesOffered: number;
  offeringPercentage: number;
  participantAdmin: string;
  underwriters: string;
  bookBuildingOpening: string;
  bookBuildingClosing: string;
  lowestBBPrice: number;
  highestBBPrice: number;
  offeringOpening: string;
  offeringClosing: string;
  closingDate: string;
  distributionDate: string;
  listingDate: string;
  warrantRatio: number;
  exercisePrice: number;
}

export type IpoStatusFilter = 'all' | 'ongoing' | 'listed' | 'postponed';

export interface IpoFilter {
  search: string;
  status: IpoStatusFilter;
  sector: string;
  year: string;
}