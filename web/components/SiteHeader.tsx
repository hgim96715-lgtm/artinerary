'use client';

import { logout, me, type AuthUser } from '@/lib/auth-api';
import { AUTH_USER_UPDATED_EVENT } from '@/lib/auth-user-sync';
import { getLastMypagePath, rememberMypagePath } from '@/lib/return-path';
import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminArea = pathname.startsWith('/admin');

  const [mypageHref,setMypageHref]=useState('/mypage/wishlist');

  useEffect(()=>{
    if(pathname.startsWith('/mypage/')){
      rememberMypagePath(pathname);
      setMypageHref(pathname);
    }else{
      setMypageHref(getLastMypagePath());
    }
  },[pathname]);

  useEffect(() => {
    setLoading(true);

    me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  useEffect(() => {
    const onUserUpdated = (e: Event) => {
      setUser((e as CustomEvent<AuthUser>).detail);
    };
    window.addEventListener(AUTH_USER_UPDATED_EVENT, onUserUpdated);
    return () => window.removeEventListener(AUTH_USER_UPDATED_EVENT, onUserUpdated);
  }, []);

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
          <nav className="flex items-center gap-1 text-sm ">
            {loading ? null : user ? (
              <>
                {user.role === 'USER'? (
                  <Link href={mypageHref} className="nav-auth-link px-2">
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
                  className="nav-auth-link ml-2 flex items-center gap-1"
                >
                로그아웃
                <LogOutIcon className="size-4" aria-hidden="true" />
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
