/** 전시 상세 → 이전 화면 복귀 (지금 바로 홈화면으로 가는 오류 해결 ts) */

/**
 * 전시 상세에서 "뒤로가기/목록으로"를 눌렀을 때
 * 사용자를 원래 보던 화면(특히 마이페이지 탭)으로 돌려보내기 위한 유틸.
 *
 * 핵심 이슈:
 * - Safari/Next 라우팅에서 기본 back 동작이 꼬이거나, 상세에서 목록으로 돌아갈 때 홈으로 튀는 경우가 있었음
 * - 그래서 상세 URL에 `?from=/mypage/wishlist` 같은 "복귀 경로"를 붙여서 명시적으로 이동함
 *
 * 보안/안정성:
 * - `from`은 URL 쿼리로 들어오므로 그대로 쓰면 오픈 리다이렉트(외부 사이트로 이동) 위험이 있음
 * - 그래서 `resolveReturnPath`에서 **우리 서비스 내부의 안전한 경로만** 통과시키고 나머지는 버림(null)
 */

const MYPAGE_LAST_PATH = 'mypage-last-path';

export const resolveReturnPath = (
  from: string | null | undefined,
): string | null | undefined => {
  if (!from) return null;

  let decoded = from;
  try {
    decoded = decodeURIComponent(from);
  } catch {
    return null;
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;

  const path = decoded.split('?')[0]?.split('#')[0] ?? '';
  if (/^\/mypage\//.test(path)) return path;
  if (path === '/exhibitions') return path;
  return null;
};

export const getReturnPathLabel = (path: string): string => {
  if (path.includes('/mypage/visits')) return '관람 기록';
  if (path.includes('/mypage/wishlist')) return '찜한 전시';
  if (path.includes('/mypage')) return '마이페이지';
  return '전시 목록 보기';
};

export const buildExhibitionHref = (
  exhibitionId: number,
  from?: string | null,
): string => {
  const base = `/exhibitions/${exhibitionId}`;
  const safe = from ? resolveReturnPath(from) : null;
  if (!safe) return base;
  return `${base}?from=${encodeURIComponent(safe)}`;
};

export const rememberMypagePath = (pathname: string) => {
  if (typeof window === 'undefined') return;
  if (!pathname.startsWith('/mypage/')) return;
  sessionStorage.setItem(MYPAGE_LAST_PATH, pathname);
};

export const getLastMypagePath = (): string => {
  if (typeof window === 'undefined') return '/mypage/wishlist';
  const saved = sessionStorage.getItem(MYPAGE_LAST_PATH);
  return resolveReturnPath(saved) ?? '/mypage/wishlist';
};
