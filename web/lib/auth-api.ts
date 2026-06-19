import { getApiBaseUrl } from '@/lib/api-base';
import { notifyAuthUserUpdated } from '@/lib/auth-user-sync';

const parseErrorMessage = async (res: Response): Promise<string> => {
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
    } else if (res.status === 401 || res.status === 403) {
      message = '인증에 실패했습니다.';
    }
  }
  return message;
};

async function authFetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
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

export const updateNickname = async (
  nickname: string,
): Promise<{ message: string } & AuthUser> => {
  const result = await authFetchAPI<{ message: string } & AuthUser>(
    '/auth/me',
    {
      method: 'PATCH',
      body: JSON.stringify({ nickname }),
    },
  );
  notifyAuthUserUpdated(result);
  return result;
};

export const changePassword = (
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> => {
  return authFetchAPI('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};
