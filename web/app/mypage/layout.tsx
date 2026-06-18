'use client';

import { me, type AuthUser } from '@/lib/auth-api';
import { AUTH_USER_UPDATED_EVENT } from '@/lib/auth-user-sync';
import {
  Bell,
  Heart,
  HelpCircle,
  ScrollText,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: '/mypage/wishlist', label: '찜한 전시', icon: Heart },
  { href: '/mypage/visits', label: '관람 기록', icon: ScrollText },
  { href: '/mypage/settings', label: '내 정보', icon: Settings },
  { href: '/mypage/notices', label: '공지사항', icon: Bell },
  { href: '/mypage/support', label: '고객센터', icon: HelpCircle },
];

const isNavActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const navLinkClass = (active: boolean) => {
  const base =
    'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors lg:w-full';
  if (active) {
    return `${base} bg-sky-100 font-semibold text-sky-700 shadow-sm ring-1 ring-sky-200/80 dark:bg-sky-900/45 dark:text-sky-100 dark:ring-sky-500/35`;
  }
  return `${base} text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-sky-950/50 dark:hover:text-sky-100`;
};

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

  useEffect(() => {
    const onUserUpdated = (e: Event) => {
      setNickname((e as CustomEvent<AuthUser>).detail.nickname);
    };
    window.addEventListener(AUTH_USER_UPDATED_EVENT, onUserUpdated);
    return () => window.removeEventListener(AUTH_USER_UPDATED_EVENT, onUserUpdated);
  }, []);

  if (!ready) {
    return <p className="text-muted">불러오는 중…</p>;
  }

  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-[var(--surface)] to-emerald-50 px-5 py-6 shadow-sm dark:border-sky-500/30 dark:from-sky-950/60 dark:via-[var(--surface)] dark:to-emerald-950/35">
        <span
          className="pointer-events-none absolute -right-2 -top-2 text-5xl text-sky-300/30 dark:text-sky-400/20"
          aria-hidden
        >
          ✦
        </span>
        <p className="text-xs font-semibold tracking-[0.2em] text-sky-500 uppercase dark:text-sky-300/90">
          my page
        </p>
        <h1 className="mt-2 text-xl font-bold leading-snug text-slate-900 sm:text-2xl dark:text-slate-50">
          안녕하세요{' '}
          <span className="text-sky-600 dark:text-sky-300">{nickname}</span>님
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          찜 · 관람 · 계정 · 공지 · 고객센터
        </p>
      </header>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <nav className="shrink-0 lg:w-52" aria-label="마이페이지 메뉴">
          <ul className="flex gap-1.5 overflow-x-auto rounded-xl border border-dashed border-sky-200/50 bg-[var(--surface-muted)] p-2 dark:border-sky-500/25 dark:bg-[var(--surface-muted)] lg:flex-col lg:overflow-visible">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(pathname, href);
              return (
                <li key={href} className="lg:w-full">
                  <Link
                    href={href}
                    className={navLinkClass(active)}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="size-4 shrink-0 opacity-85" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 rounded-2xl border border-sky-200/40 bg-white p-5 shadow-md ring-1 ring-sky-100/60 sm:p-6 dark:border-sky-500/20 dark:bg-[var(--surface)] dark:ring-sky-900/30">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MyPageLayout;
