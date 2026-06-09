export const CULTURE_API_PROVIDER = 'culture-api';

export type CultureListItem = {
  serviceName?: string;
  realmName?: string;
  seq?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  place?: string;
  area?: string;
  sigungu?: string;
  thumbnail?: string;
  gpsX?: string;
  gpsY?: string;
  price?: string;
  placeUrl?: string;
};

export type CultureDetailItem = CultureListItem & {
  place?: string;
  contents1?: string;
  url?: string;
  imgUrl?: string;
  placeAddr?: string;
};
