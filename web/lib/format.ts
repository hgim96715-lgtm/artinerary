export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}

export function getExhibitionStatus(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (now < startDate) {
    return { label: '예정', color: 'bg-blue-100 text-blue-800' };
  }
  if (now >= startDate && now <= endDate) {
    return { label: '진행중', color: 'bg-green-100 text-green-800' };
  }
  return { label: '종료', color: 'bg-gray-100 text-gray-600' };
}

export function isOngoing(start: string, end: string) {
  const now = new Date();
  return now >= new Date(start) && now <= new Date(end);
}

export function getPlace(exhibition: {
  venueName: string | null;
  area: string | null;
  address: string | null;
}) {
  return [exhibition.venueName, exhibition.area, exhibition.address]
    .filter(Boolean)
    .join(' · ');
}

type LocationFields = {
  venueName: string | null;
  area: string | null;
  address: string | null;
};

export type LocationDetail = {
  venueName: string | null;
  region: string | null;
  address: string | null;
};

/* 문자열 양쪽 공백 제거, 빈 문자열인 경우 null 반환 */
const trimOrNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/* 주소에 시도명이 포함되어 있는지 확인 */
const addressIncludesArea = (address: string, area: string) => {
  if (address.includes(area)) {
    return true;
  }
  const sidoFullName: Record<string, string> = {
    서울: '서울특별시',
    부산: '부산광역시',
    대구: '대구광역시',
    인천: '인천광역시',
    광주: '광주광역시',
    대전: '대전광역시',
    울산: '울산광역시',
    세종: '세종특별자치시',
    제주: '제주특별자치도',
    경기: '경기도',
    강원: '강원',
    충북: '충청북도',
    충남: '충청남도',
    전북: '전라북도',
    전남: '전라남도',
    경북: '경상북도',
    경남: '경상남도',
  };
  const full = sidoFullName[area];
  return full ? address.includes(full) : false;
};

/* 주소 끝에 장소명이 중복으로 붙어 있으면 그 장소명을 제거하고, 남은 주소가 없으면 null을 반환 */
const trimVenueFromAddress = (address: string, venueName: string) => {
  const trimmed = address.trim();
  if (!trimmed.endsWith(venueName)) {
    return trimmed;
  }
  const withoutVenue = trimmed
    .slice(0, -venueName.length)
    .replace(/[,\s·]+$/, '')
    .trim();
  return withoutVenue ? withoutVenue : null;
};

/* 위치 정보 포맷팅 */
/*region은 시도명이 포함되어 있는지 확인하고, 포함되어 있지 않으면 시도명을 반환*/
export const formatLocationDetail = (
  exhibition: LocationFields,
): LocationDetail | null => {
  const venueName = trimOrNull(exhibition.venueName);
  const area = trimOrNull(exhibition.area);
  let address = trimOrNull(exhibition.address);

  if (venueName && address) {
    address = trimVenueFromAddress(address, venueName) ?? address;
  }

  const region =
    area && (!address || !addressIncludesArea(address, area)) ? area : null;

  if (!venueName && !region && !address) {
    return null;
  }
  return {
    venueName,
    region,
    address,
  };
};

/* 지도 검색 링크 생성 */
const GOOGLE_MAPS_SEARCH_URL =
  'https://www.google.com/maps/search/?api=1&query=';

const toGoogleMapsSearchUrl = (query: string) => {
  return `${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent(query)}`;
};

const parseCoords = (
  latitude: string | null,
  longitude: string | null,
): { lat: number; lng: number } | null => {
  const lat = latitude ? Number(latitude) : NaN;
  const lng = longitude ? Number(longitude) : NaN;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

export const getMapsSearchUrl = (
  exhibition: LocationFields & {
    latitude: string | null;
    longitude: string | null;
  },
): string | null => {
  const detail = formatLocationDetail(exhibition);
  const coords = parseCoords(exhibition.latitude, exhibition.longitude);
  if (detail?.venueName) {
    const withRegion = [detail.venueName, detail.region]
      .filter(Boolean)
      .join(' ');
    return toGoogleMapsSearchUrl(withRegion);
  }
  if (detail) {
    const textQuery = [detail.venueName, detail.region, detail.address]
      .filter(Boolean)
      .join(' ');
    return toGoogleMapsSearchUrl(textQuery);
  }
  if (coords) {
    return toGoogleMapsSearchUrl(`${coords.lat},${coords.lng}`);
  }
  return null;
};
