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

export function getExhibitions(): Promise<Exhibition[]> {
  return fetchAPI<Exhibition[]>('/exhibitions');
}

export async function getExhibition(id: string | number): Promise<Exhibition> {
  const json = await fetchAPI<ExhibitionDetailResponse>(`/exhibitions/${id}`);
  return json?.data;
}
