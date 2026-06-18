/** 로그인 후 돌아갈 경로 — 내부 경로만 허용 */
export const buildLoginHref = (from: string) => {
  const safe =
    from.startsWith('/') && !from.startsWith('//') ? from : '/';
  return `/login?from=${encodeURIComponent(safe)}`;
};

export const resolveLoginRedirect = (
  from: string | null | undefined,
  role: 'USER' | 'ADMIN',
) => {
  if (role === 'ADMIN') {
    return '/admin/exhibitions';
  }
  if (
    from &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    from !== '/login' &&
    !from.startsWith('/signup') &&
    !from.startsWith('/admin')
  ) {
    return from;
  }
  return '/';
};
