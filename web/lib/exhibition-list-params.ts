export type ExhibitionListStatus = 'ongoing' | 'upcoming' | 'ended';

export function buildExhibitionParams(params: {
  area?: string;
  status?: ExhibitionListStatus;
  q?: string;
}) {
  const sp = new URLSearchParams();
  if (params.area) sp.set('area', params.area);
  if (params.status) sp.set('status', params.status);
  if (params.q?.trim()) sp.set('q', params.q.trim());
  const qs = sp.toString();
  return qs ? `/exhibitions?${qs}` : '/exhibitions';
}
