'use client';

import { addWishlist, removeWishlist } from '@/lib/wishlist-api';
import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  exhibitionId: number;
  canUse: boolean;
  wishlisted: boolean;
  onWishlistChange: (next: boolean) => void;
};

/**
 * 찜 버튼 — ExhibitionUserActions가 me-status로 상태를 주입
 * 클릭 시 addWishlist / removeWishlist → onWishlistChange로 부모 state 갱신
 */
export function WishlistButton({
  exhibitionId,
  canUse,
  wishlisted,
  onWishlistChange,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onToggleWishlist() {
    if (!canUse || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      if (wishlisted) {
        await removeWishlist(exhibitionId);
        onWishlistChange(false);
      } else {
        await addWishlist(exhibitionId);
        onWishlistChange(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('오류가 발생했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!canUse) {
    return (
      <p className="text-sm text-muted">
        <Link href="/login" className="link-action">
          로그인
        </Link>{' '}
        하면 찜 기능을 사용할 수 있습니다
        <ArrowRight />
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onToggleWishlist}
        disabled={submitting}
        className="inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        aria-pressed={wishlisted}
        aria-label={wishlisted ? '찜 취소' : '찜 하기'}
      >
        <Heart
          className={`size-5 ${wishlisted ? 'fill-red-500' : 'text-gray-500'}`}
        />
        {wishlisted ? '찜 취소' : '찜 하기'}
      </button>
      {error && <p className="text-error">{error}</p>}
    </div>
  );
}
