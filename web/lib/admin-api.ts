const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function adminFetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
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
    throw new Error(`아이디 또는 비밀번호가 일치하지 않습니다.`);
  }
  return res.json();
}

export type AdminExhibitionRow = {
  id: number;
  title: string;
  area: string | null;
  venueName: string | null;
  source: string;
  isVisible: boolean;
  startDate: string;
  endDate: string;
  description: string | null;
  sourceUrl: string | null;
};

export type AdminMe = {
  email: string;
  role: 'ADMIN';
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
  body: { description?: string; sourceUrl?: string; isVisible?: boolean },
): Promise<{ message: string; id: number }> {
  return adminFetchAPI<{ message: string; id: number }>(`/exhibitions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
