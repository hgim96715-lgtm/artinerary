import { getApiBaseUrl } from './api-base';

async function noticeFetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
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
      if (res.status === 404) {
        message = '공지사항을 찾을 수 없습니다.';
      }
    }
    throw new Error(message);
  }
  return res.json();
}

export type NoticeListItem = {
  id: number;
  title: string;
  isPinned: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export type NoticeDetail = {
  id: number;
  title: string;
  body: string;
  publishedAt: string | null;
  createdAt: string;
};

export const getNotices = (): Promise<NoticeListItem[]> => {
  return noticeFetchAPI<NoticeListItem[]>('/notice', { method: 'GET' });
};

export const getNotice = (id: number): Promise<NoticeDetail> => {
  return noticeFetchAPI<NoticeDetail>(`/notice/${id}`, { method: 'GET' });
};
