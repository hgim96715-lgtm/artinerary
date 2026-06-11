'use client';

import { logout, me, type AuthUser } from '@/lib/auth-api';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminArea = pathname.startsWith('/admin');

  useEffect(() => {
    setLoading(true);

    me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  async function onLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
      router.push('/');
      router.refresh();
    }
  }

  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-xl font-semibold hover:opacity-80">
          Artinerary
        </Link>
        {!isAdminArea && (
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            {loading ? null : user ? (
              <>
                {user.role === 'USER'? (
                  <Link href="/mypage" className="nav-auth-link px-2">
                    {user.nickname}님
                  </Link>
                ):(
                    <span className="px-2 font-medium">{user.nickname}님</span>
                )}
                {user.role === 'ADMIN' && (
                  <Link href="/admin/exhibitions" className="nav-auth-link">
                    관리창
                  </Link>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="nav-auth-link"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/signup" className="nav-auth-link">
                  회원가입
                </Link>
                <span className="nav-auth-divider" aria-hidden="true" />
                <Link href="/login" className="nav-auth-link nav-auth-link--primary">
                  로그인
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
