const resolveServerBaseUrl = () => {
  const internal = process.env.API_INTERNAL_URL;
  if (internal) {
    return internal;
  }
  const publicUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  if (publicUrl.startsWith('/')) {
    return 'http://localhost:3000';
  }
  return publicUrl;
};

/** 브라우저: same-site 프록시 · 서버(RSC): Railway 직접 */
export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return resolveServerBaseUrl();
  }
  return process.env.NEXT_PUBLIC_API_URL ?? '/api/nest';
};
