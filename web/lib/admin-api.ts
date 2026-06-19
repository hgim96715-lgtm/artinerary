import { getApiBaseUrl } from '@/lib/api-base';
import type { ExhibitionSource } from './types/exhibition';

export type AdminExhibitionActivity = {
  date: string;
  summary: {
    signups: number;
    wishlists: number;
    reviews: number;
    visits: number;
    exhibitionEdits: number;
  };
  signups: {
    id: number;
    nickname: string;
    createdAt: string;
    email: string;
  }[];
  wishlists: {
    id: number;
    createdAt: string;
    nickname: string;
    userId: number;
    exhibitionId: number;
    exhibitionTitle: string;
  }[];
  visits: {
    id: number;
    createdAt: string;
    updatedAt: string;
    visitedAt: string;
    note: string;
    rating: number;
    nickname: string;
    userId: number;
    exhibitionId: number;
    exhibitionTitle: string;
  }[];
  exhibitionEdits: {
    id: number;
    title: string;
    source: ExhibitionSource;
    isVisible: boolean;
    updatedAt: string;
  }[];
};

export type AdminUserRow = {
  id: number;
  nickname: string;
  email: string;
  createdAt: string;
  wishlistCount: number;
  visitCount: number;
};

export type AdminUsersResponse = {
  total: number;
  users: AdminUserRow[];
};

async function adminFetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
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

export type AdminExhibitionRow = {
  id: number;
  title: string;
  area: string | null;
  venueName: string | null;
  source: ExhibitionSource;
  isVisible: boolean;
  startDate: string;
  endDate: string;
  description: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
};

export type CreateExhibitionBody = {
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
  imageUrl?: string;
  sourceUrl?: string;
  venueName?: string;
  area?: string;
  address?: string;
  isVisible?: boolean;
};

export type AdminMe = {
  email: string;
  role: 'ADMIN';
  nickname: string;
};

export function adminLogin(
  email: string,
  password: string,
): Promise<{ message: string; email: string; role: string }> {
  return adminFetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function createExhibition(
  body: CreateExhibitionBody,
): Promise<{ message: string; id: number }> {
  return adminFetchAPI<{ message: string; id: number }>('/exhibitions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function adminLogout() {
  return adminFetchAPI<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}

export function adminMe(): Promise<AdminMe> {
  return adminFetchAPI<AdminMe>('/auth/me', {
    method: 'GET',
  });
}

export function adminExhibitions(): Promise<AdminExhibitionRow[]> {
  return adminFetchAPI<AdminExhibitionRow[]>('/exhibitions/admin/list', {
    method: 'GET',
  });
}

export function adminExhibition(id: number): Promise<AdminExhibitionRow> {
  return adminFetchAPI<AdminExhibitionRow>(`/exhibitions/admin/${id}`, {
    method: 'GET',
  });
}

export function patchExhibition(
  id: number,
  body: {
    title?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    sourceUrl?: string;
    venueName?: string;
    area?: string;
    isVisible?: boolean;
    imageUrl?: string | null;
  },
): Promise<{ message: string; id: number }> {
  return adminFetchAPI<{ message: string; id: number }>(`/exhibitions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteExhibition(
  id: number,
): Promise<{ message: string; id: number }> {
  return adminFetchAPI<{ message: string; id: number }>(`/exhibitions/${id}`, {
    method: 'DELETE',
  });
}

export type CollectResult = {
  listed: number;
  filtered: number;
  upserted: number;
  skipped: number;
  failed: number;
};

export function adminCollect(): Promise<CollectResult> {
  return adminFetchAPI<CollectResult>('/collector/collect', {
    method: 'POST',
  });
}

// AI

export function generateExhibitionDescription(
  id: number,
): Promise<{ description: string }> {
  return adminFetchAPI<{ description: string }>(
    `/exhibitions/admin/${id}/generate-description`,
    {
      method: 'POST',
    },
  );
}

/* Admin Activity */
export function adminTodayActivity(): Promise<AdminExhibitionActivity> {
  return adminFetchAPI<AdminExhibitionActivity>('/admin/activity/today', {
    method: 'GET',
  });
}

/* Admin Users */
export function adminUsers(): Promise<AdminUsersResponse> {
  return adminFetchAPI<AdminUsersResponse>('/admin/users', {
    method: 'GET',
  });
}
