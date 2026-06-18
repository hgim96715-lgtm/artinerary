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
import { useState, type KeyboardEvent, type MouseEvent } from 'react';

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
  const wishlistedLabel = formatWishlistedAt(item.wishlistedAt);

  const onFlip = () => setFlipped((v) => !v);

  const onFlipKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };

  const onRemoveWishlist = async (e: MouseEvent) => {
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

  const poster = item.imageUrl ? (
    <img src={item.imageUrl} alt="" />
  ) : (
    <div className="flex h-full items-center justify-center p-4 text-center text-sm font-medium text-gray-500">
      {title}
    </div>
  );

  return (
    <div className="visit-ticket">
      <div
        className={`visit-ticket-inner ${flipped ? 'visit-ticket-inner--flipped' : ''}`}
      >
        <div
          className="visit-ticket-face visit-ticket-front visit-ticket-flip"
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
            {poster}
            <button
              type="button"
              onClick={onRemoveWishlist}
              disabled={submitting}
              className="wishlist-card-heart"
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
            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${status.color}`}
            >
              {status.label}
            </span>
          </div>
          <div className="wishlist-card-caption">
            <p
              className={
                place
                  ? 'wishlist-card-caption-primary line-clamp-1'
                  : 'wishlist-card-caption-primary line-clamp-2'
              }
            >
              {place ?? title}
            </p>
            <p className="wishlist-card-caption-secondary line-clamp-1">
              {formatDateRange(item.startDate, item.endDate)}
            </p>
          </div>
          {error ? (
            <p className="text-error px-2 pb-1 text-center text-xs">{error}</p>
          ) : null}
        </div>

        <div
          className="visit-ticket-face visit-ticket-back visit-ticket-flip"
          onClick={onFlip}
          onKeyDown={onFlipKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`${title} 찜 카드 닫기`}
        >
          <div className="visit-ticket-back-thumb">
            {poster}
            <span className="wishlist-card-badge">
              <Heart className="size-3 fill-red-500 text-red-500" aria-hidden />
              찜 {wishlistedLabel}
            </span>
          </div>

          <div className="visit-ticket-back-body">
            <span
              className={`mx-auto inline-block rounded-full px-2 py-0.5 text-xs ${status.color}`}
            >
              {status.label}
            </span>
            <h2 className="visit-ticket-back-title">{title}</h2>
            {place ? (
              <p className="visit-ticket-back-place">{place}</p>
            ) : null}
            <p className="text-[11px] text-gray-600">
              {formatDateRange(item.startDate, item.endDate)}
            </p>
          </div>

          <div className="visit-ticket-back-footer">
            <Link
              href={`/exhibitions/${item.id}`}
              className="visit-ticket-back-link"
              onClick={(e) => e.stopPropagation()}
            >
              전시 상세 보기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
