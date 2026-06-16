export type ExhibitionListStatus = 'ongoing' | 'upcoming' | 'ended';

export function buildExhibitionParams(params: {
  area?: string;
  status?: ExhibitionListStatus;
}) {
  const sp = new URLSearchParams();
  if (params.area) sp.set('area', params.area);
  if (params.status) sp.set('status', params.status);
  const qs = sp.toString();
  return qs ? `/exhibitions?${qs}` : '/exhibitions';
}
