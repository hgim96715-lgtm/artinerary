'use client';

import { me } from '@/lib/auth-api';
import {
  ExhibitionMeStatus,
  getExhibitionMeStatus,
} from '@/lib/me-status-api';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { WishlistButton } from './WishlistButton';
import VisitButton from './VisitButton';

type Props = { exhibitionId: number };

export const ExhibitionUserActions = ({ exhibitionId }: Props) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [canUse, setCanUse] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [status, setStatus] = useState<ExhibitionMeStatus>({
    isWishlisted: false,
    visit: null,
  });

  const reload = useCallback(async () => {
    const user = await me();
    if (user.role === 'ADMIN') {
      setIsAdmin(true);
      setCanUse(false);
      setStatusError('');
      return;
    }
    setIsAdmin(false);
    if (user.role !== 'USER') {
      setCanUse(false);
      setStatusError('');
      return;
    }
    setCanUse(true);
    try {
      const data = await getExhibitionMeStatus(exhibitionId);
      setStatus(data);
      setStatusError('');
    } catch (err: unknown) {
      setStatus({ isWishlisted: false, visit: null });
      setStatusError(
        err instanceof Error
          ? err.message
          : '찜·관람 상태를 불러오지 못했습니다.',
      );
    }
  }, [exhibitionId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        await reload();
      } catch {
        if (!cancelled) {
          setCanUse(false);
          setIsAdmin(false);
          setStatusError('');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    const onRefresh = (e: Event) => {
      if (e.type === 'pageshow') {
        const pe = e as PageTransitionEvent;
        if (!pe.persisted) return;
      }
      void load();
    };

    window.addEventListener('pageshow', onRefresh);
    window.addEventListener('focus', onRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener('pageshow', onRefresh);
      window.removeEventListener('focus', onRefresh);
    };
  }, [reload, pathname]);

  if (loading) {
    return null;
  }

  if (isAdmin) {
    return (
      <div className="exhibition-book-actions space-y-2 border-l-2 border-amber-200/80 pl-3 text-sm text-muted">
        <p>
          <span className="font-medium text-foreground text-muted">찜</span> -
          일반 회원만 사용할 수 있습니다.
        </p>
        <p>
          <span className="font-medium text-foreground text-muted">
            관람기록
          </span>{' '}
          - 일반 회원만 사용할 수 있습니다.
        </p>
        <p className="text-xs text-rose-500/80">
          관리자 계정으로는 이용할 수 없어요. 일반 회원으로 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="exhibition-book-actions space-y-2">
      <WishlistButton
        exhibitionId={exhibitionId}
        canUse={canUse}
        wishlisted={status.isWishlisted}
        onWishlistChange={(next) => {
          setStatus((s) => ({ ...s, isWishlisted: next }));
        }}
      />
      <VisitButton
        exhibitionId={exhibitionId}
        canUse={canUse}
        visit={status.visit}
        onVisitChange={(visit) => {
          setStatus((s) => ({
            ...s,
            visit,
            isWishlisted: visit ? false : s.isWishlisted,
          }));
        }}
      />
      {statusError ? <p className="text-error text-xs">{statusError}</p> : null}
    </div>
  );
};
