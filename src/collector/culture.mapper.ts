import {
  ExhibitionFeeType,
  ExhibitionSource,
  Prisma,
} from 'generated/prisma/client';
import {
  CULTURE_API_PROVIDER,
  CultureDetailItem,
  CultureListItem,
} from './culture-api.types';

export const isExhibitionItem = (item: CultureListItem) => {
  return item.serviceName === '전시' || item.realmName === '전시';
};

const parseYmd = (value?: string): Date | null => {
  if (!value || value.length !== 8) return null;
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(4, 6)) - 1;
  const d = Number(value.slice(6, 8));
  const date = new Date(y, m, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseFeeType = (price?: string): ExhibitionFeeType => {
  const text = (price ?? '').trim();
  if (!text || text.includes('무료') || text === '0원')
    return ExhibitionFeeType.FREE;
  if (text.includes('유료') || /\d/.test(text)) return ExhibitionFeeType.PAID;
  return ExhibitionFeeType.UNKNOWN;
};

const decodeXmlText = (value?: string) =>
  value
    ?.replace(/&amp;lt;/g, '<')
    .replace(/&amp;gt;/g, '>')
    .replace(/&amp;amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim() || null;

const toFloat = (value?: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const mergeToExhibitionData = (
  list: CultureListItem,
  detail: CultureDetailItem | null,
): Prisma.ExhibitionCreateInput | null => {
  const merged = { ...list, ...(detail ?? {}) };
  const startDate = parseYmd(merged.startDate);
  const endDate = parseYmd(merged.endDate);
  const seq = merged.seq?.toString();
  const title = merged.title?.trim();
  if (!seq || !title || !startDate || !endDate) return null;

  const address =
    merged.placeAddr?.trim() ||
    [merged.area, merged.sigungu].filter(Boolean).join(' ').trim() ||
    null;

  return {
    source: ExhibitionSource.API,
    apiProvider: CULTURE_API_PROVIDER,
    externalId: seq,
    title,
    description: decodeXmlText(merged.contents1),
    imageUrl: merged.imgUrl || merged.thumbnail || null,
    sourceUrl: merged.placeUrl?.trim() || merged.url?.trim() || null,
    startDate,
    endDate,
    priceText: merged.price?.trim() || null,
    feeType: parseFeeType(merged.price),
    venueName: merged.place?.trim() || null,
    area: merged.area?.trim() || null,
    address,
    latitude: toFloat(merged.gpsY),
    longitude: toFloat(merged.gpsX),
    isVisible: true,
  };
};
