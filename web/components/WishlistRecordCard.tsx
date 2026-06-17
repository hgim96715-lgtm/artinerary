'use client';

import {
  formatDateRange,
  formatExhibitionTitle,
  getExhibitionStatus,
  getPlace,
} from '@/lib/format';
import { removeWishlist, type WishlistItem } from '@/lib/wishlist-api';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  item: WishlistItem;
  onRemove: (exhibitionId: number) => void;
};

const formatWishlistedAt = (iso: string) => {
  return iso.slice(0, 10).replace(/-/g, '.');
};

export const WishlistRecordCard = ({ item, onRemove }: Props) => {
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const place = getPlace({ ...item, address: null });
  const title = formatExhibitionTitle(item.title);
  const status = getExhibitionStatus(item.startDate, item.endDate);

  const onFlip = () => setFlipped((v) => !v);

  const onFlipKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };

  const onRemoveWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await removeWishlist(item.id);
      onRemove(item.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '찜 해제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="visit-ticket">
      <div
        className={`visit-ticket-inner ${flipped ? 'visit-ticket-inner--flipped' : ''}`}
      >
        <div
          className="visit-ticket-face visit-ticket-front cursor-pointer"
          onClick={onFlip}
          onKeyDown={onFlipKeyDown}
          role="button"
          tabIndex={0}
          aria-label={
            flipped ? `${title} 찜 카드 닫기` : `${title} 찜 상세 보기`
          }
          aria-pressed={flipped}
        >
          <div className="visit-ticket-poster">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm font-medium text-gray-500">
                {title}
              </div>
            )}
          </div>
          <p className="visit-ticket-date flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={onRemoveWishlist}
              disabled={submitting}
              className="inline-flex shrink-0 disabled:opacity-50"
              aria-label="찜 해제"
            >
              <Heart
                className={`size-4 transition-colors ${
                  submitting
                    ? 'text-gray-400'
                    : 'fill-red-500 text-red-500 hover:fill-gray-300 hover:text-gray-400'
                }`}
              />
            </button>
            <span className="line-clamp-1">{place ?? '장소 정보 없음'}</span>
          </p>
          {error && (
            <p className="text-error px-2 pb-1 text-center text-xs">{error}</p>
          )}
        </div>

        <div
          className="visit-ticket-face visit-ticket-back cursor-pointer"
          onClick={onFlip}
          onKeyDown={onFlipKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`${title} 찜 카드 닫기`}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden text-center">
            <span
              className={`mx-auto inline-block rounded-full px-2 py-0.5 text-xs ${status.color}`}
            >
              {status.label}
            </span>
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
              {title}
            </h2>
            {place && <p className="line-clamp-1 text-xs text-muted">{place}</p>}
            <p className="text-xs leading-relaxed text-gray-700">
              {formatDateRange(item.startDate, item.endDate)}
            </p>
            <p className="text-xs text-muted">
              찜한 날 {formatWishlistedAt(item.wishlistedAt)}
            </p>
          </div>
          <Link
            href={`/exhibitions/${item.id}`}
            className="link-action mt-3 block text-center text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            전시 상세 보기
          </Link>
        </div>
      </div>
    </div>
  );
};
