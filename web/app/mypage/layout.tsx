'use client';

import { FilterChip } from '@/components/FilterChip';
import { logout, me } from '@/lib/auth-api';
import { LogOutIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { href: '/mypage/wishlist', label: '찜한 전시' },
  { href: '/mypage/visits', label: '관람 기록' },
  { href: '/mypage/settings', label: '내 정보 수정' },
  { href: '/mypage/notices', label: '공지사항' },
  { href: '/mypage/support', label: '고객센터' },
] as const;

const isNavActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const MyPageLayout = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [nickname, setNickname] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await me();
        if (user.role !== 'USER') {
          router.replace('/');
          return;
        }
        setNickname(user.nickname);
        setReady(true);
      } catch {
        router.replace('/login');
      }
    };
    void load();
  }, [router]);

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  if (!ready) {
    return <p className="text-muted">불러오는 중…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="page-title">
          안녕하세요👋
          <br />
          {nickname}님의 마이페이지
        </h1>
        <p className="text-muted text-sm">
          찜 · 관람 · 계정 · 공지 · 고객센터
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav
          className="flex shrink-0 flex-col gap-2 lg:w-44"
          aria-label="마이페이지 메뉴"
        >
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
            {NAV_ITEMS.map(({ href, label }) => (
              <FilterChip
                key={href}
                as="link"
                href={href}
                active={isNavActive(pathname, href)}
                className="lg:text-center"
              >
                {label}
              </FilterChip>
            ))}
          </div>
          {/* <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 self-start px-1 py-2 text-sm text-gray-600 hover:text-accent-link lg:mt-2"
          >
            <LogOutIcon className="size-4" aria-hidden />
            로그아웃
          </button> */}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default MyPageLayout;
