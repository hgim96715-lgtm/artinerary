import type { AuthUser } from '@/lib/auth-api';

export const AUTH_USER_UPDATED_EVENT = 'artinerary-auth-user-updated';

export const notifyAuthUserUpdated = (user: AuthUser) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<AuthUser>(AUTH_USER_UPDATED_EVENT, { detail: user }),
  );
};
