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
