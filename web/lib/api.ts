import { ExhibitionListStatus } from './exhibition-list-params';
import { Exhibition, ExhibitionDetailResponse } from './types/exhibition';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
      'Cache-Control': 'no-store',
    },
    ...options,
  });
  if (res.status === 404) {
    return null as unknown as T;
  }
  if (!res.ok) {
    throw new Error(
      `HTTP error! status: ${res.status}: ${endpoint} ${res.statusText}`,
    );
  }
  return res.json();
}
export type ExhibitionAreaStat = { area: string; count: number };

export function getExhibitions(
  area?: string,
  status?: ExhibitionListStatus,
  q?: string,
): Promise<Exhibition[]> {
  const sp = new URLSearchParams();
  if (area) sp.set('area', area);
  if (status) sp.set('status', status);
  if (q?.trim()) sp.set('q', q.trim());
  const qs = sp.toString();
  return fetchAPI<Exhibition[]>(`/exhibitions${qs ? `?${qs}` : ''}`);
}

export async function getExhibition(id: string | number): Promise<Exhibition> {
  const json = await fetchAPI<ExhibitionDetailResponse>(`/exhibitions/${id}`);
  return json?.data;
}

export function getExhibitionAreas(
  status?: ExhibitionListStatus,
): Promise<ExhibitionAreaStat[]> {
  const sp = new URLSearchParams();
  if (status) sp.set('status', status);
  const qs = sp.toString();
  return fetchAPI<ExhibitionAreaStat[]>(
    `/exhibitions/areas${qs ? `?${qs}` : ''}`,
  );
}
