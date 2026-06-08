export type ExhibitionSource = 'MANUAL' | 'API';
export type ExhibitionFeeType = 'FREE' | 'PAID' | 'UNKNOWN';

export type Exhibition = {
  id: number;
  source: ExhibitionSource;
  externalId: string | null;
  apiProvider: string | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  startDate: string;
  endDate: string;
  venueName: string | null;
  area: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  priceText: string | null;
  discountText: string | null;
  feeType: ExhibitionFeeType;
};

export type ExhibitionDetailResponse = {
  message: string;
  data: Exhibition;
};
