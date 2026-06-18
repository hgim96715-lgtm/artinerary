import { getApiBaseUrl } from '@/lib/api-base';

async function visitFetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    let message = '요청에 실패했습니다.';
    try {
      const body = (await res.json()) as {
        message?: string | string[];
      };
      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      if (res.status === 400) {
        message = '입력값을 확인해 주세요.';
      }
    }
    throw new Error(message);
  }
  return res.json();
}

export type VisitItem = {
  visitId: number;
  visitedAt: string;
  note: string | null;
  rating: number | null;
  isPublic: boolean;
  id: number;
  title: string;
  area: string | null;
  venueName: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  photoUrl?: string | null;
  isExhibitionVisible: boolean;
  isEnded: boolean;
  canOpenDetail: boolean;
};

export type UpsertVisitBody = {
  visitedAt?: string;
  note?: string;
  rating?: number;
  isPublic?: boolean;
  photoUrl?: string;
};

export function getMyVisits(): Promise<VisitItem[]> {
  return visitFetchAPI<VisitItem[]>('/me/visits', { method: 'GET' });
}

export function upsertVisit(
  exhibitionId: number,
  body: UpsertVisitBody,
): Promise<{ message: string; visitId: number }> {
  return visitFetchAPI(`/exhibitions/${exhibitionId}/visits`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** 마이페이지 관람 카드 수정·삭제  */
export const updateVisit = (
  visitId: number,
  body: UpsertVisitBody,
): Promise<{ message: string; visitId: number }> => {
  return visitFetchAPI(`/visits/${visitId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

/** 관람 기록 삭제 — 전시 종료·비공개여도 row는 유지하다가, 유저가 직접 지울 때만 호출 */
export const deleteVisit = (
  visitId: number,
): Promise<{ message: string; visitId: number }> => {
  return visitFetchAPI(`/visits/${visitId}`, {
    method: 'DELETE',
  });
};
