const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type ExhibitionVisitHistory = {
  visitId: number;
  visitedAt: string;
  note: string | null;
  rating: number | null;
  isPublic: boolean;
};

export type ExhibitionMeStatus = {
  isWishlisted: boolean;
  visit: ExhibitionVisitHistory | null;
};

async function meStatusFetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
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

export function getExhibitionMeStatus(
  exhibitionId: number,
): Promise<ExhibitionMeStatus> {
  return meStatusFetchAPI<ExhibitionMeStatus>(
    `/exhibitions/${exhibitionId}/me-status`,
  );
}
