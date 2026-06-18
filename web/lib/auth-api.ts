import { getApiBaseUrl } from '@/lib/api-base';

async function authFetchAPI<T>(
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
    throw new Error('인증에 실패했습니다.');
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

export type AuthUser = {
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
};

export function signup(body: {
  email: string;
  password: string;
  nickname: string;
}): Promise<{ message: string } & AuthUser> {
  return authFetchAPI('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function login(
  email: string,
  password: string,
): Promise<{ message: string } & AuthUser> {
  return authFetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ message: string }> {
  return authFetchAPI('/auth/logout', {
    method: 'POST',
  });
}

export function me(): Promise<AuthUser> {
  return authFetchAPI<AuthUser>('/auth/me', {
    method: 'GET',
  });
}
