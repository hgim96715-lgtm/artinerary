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

const CANONICAL_SIDO = new Set([
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
]);

/** API area / 주소 표기 → 필터용 짧은 시·도명 */
const AREA_ALIASES: Record<string, string> = {
  서울특별시: '서울',
  서울시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원도: '강원',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전라북도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
  제주도: '제주',
};

/** placeAddr 앞부분에서 시·도 추출 (area가 이상할 때 보조) */
const SIDO_IN_ADDRESS: [substring: string, canonical: string][] = [
  ['서울특별시', '서울'],
  ['서울시', '서울'],
  ['부산광역시', '부산'],
  ['대구광역시', '대구'],
  ['인천광역시', '인천'],
  ['광주광역시', '광주'],
  ['대전광역시', '대전'],
  ['울산광역시', '울산'],
  ['세종특별자치시', '세종'],
  ['경기도', '경기'],
  ['강원특별자치도', '강원'],
  ['강원도', '강원'],
  ['충청북도', '충북'],
  ['충청남도', '충남'],
  ['전라북도', '전북'],
  ['전라남도', '전남'],
  ['경상북도', '경북'],
  ['경상남도', '경남'],
  ['제주특별자치도', '제주'],
];

const looksLikeSigungu = (value: string) => {
  if (CANONICAL_SIDO.has(value) || AREA_ALIASES[value]) return false;
  if (value === '세종시') return false;
  return /(?:시|군|구)$/.test(value);
};

const inferSidoFromAddress = (addr: string): string | null => {
  for (const [prefix, canonical] of SIDO_IN_ADDRESS) {
    if (addr.startsWith(prefix)) return canonical;
  }
  return null;
};

const inferSidoFromText = (text: string): string | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fromAddr = inferSidoFromAddress(trimmed);
  if (fromAddr) return fromAddr;

  const first = trimmed.split(/\s+/)[0];
  if (CANONICAL_SIDO.has(first)) return first;
  if (AREA_ALIASES[first]) return AREA_ALIASES[first];
  return null;
};

const normalizeArea = (
  area?: string,
  placeAddr?: string,
  sigungu?: string,
): string | null => {
  const raw = area?.trim();
  const addr = placeAddr?.trim();
  const sig = sigungu?.trim();
  if (raw) {
    if (CANONICAL_SIDO.has(raw)) return raw;
    const aliased = AREA_ALIASES[raw];
    if (aliased) return aliased;
  }
  if (raw && looksLikeSigungu(raw)) {
    if (addr) {
      const fromAddr = inferSidoFromAddress(addr);
      if (fromAddr) return fromAddr;
    }
    const combo = [raw, sig]
      .filter((v, i, arr) => v && arr.indexOf(v) === i)
      .join(' ');
    const fromCombo = inferSidoFromText(combo);
    if (fromCombo) return fromCombo;
    return null;
  }
  if (addr) {
    const fromAddr = inferSidoFromAddress(addr);
    if (fromAddr) return fromAddr;
  }

  if (raw || sig) {
    const fromCombo = inferSidoFromText([raw, sig].filter(Boolean).join(' '));
    if (fromCombo) return fromCombo;
  }
  return null;
};

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
    area: normalizeArea(merged.area, merged.placeAddr, merged.sigungu) || null,
    address,
    latitude: toFloat(merged.gpsY),
    longitude: toFloat(merged.gpsX),
    isVisible: true,
  };
};
