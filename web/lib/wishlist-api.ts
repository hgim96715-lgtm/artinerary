import { getApiBaseUrl } from '@/lib/api-base';

async function wishlistFetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
  } catch {
    throw new Error('목록을 불러오지 못했습니다.');
  }
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

export type WishlistItem = {
  id: number;
  title: string;
  area: string | null;
  venueName: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  wishlistedAt: string;
};

export function getMyWishlist(): Promise<WishlistItem[]> {
  return wishlistFetchAPI<WishlistItem[]>('/me/wishlist', {
    method: 'GET',
  });
}

export function addWishlist(
  exhibitionId: number,
): Promise<{ message: string; exhibitionId: number }> {
  return wishlistFetchAPI<{ message: string; exhibitionId: number }>(
    `/exhibitions/${exhibitionId}/wishlist`,
    {
      method: 'POST',
    },
  );
}

export function removeWishlist(
  exhibitionId: number,
): Promise<{ message: string; exhibitionId: number }> {
  return wishlistFetchAPI<{ message: string; exhibitionId: number }>(
    `/exhibitions/${exhibitionId}/wishlist`,
    {
      method: 'DELETE',
    },
  );
}
