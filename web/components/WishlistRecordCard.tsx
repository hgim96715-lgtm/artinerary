'use client';

import {
  formatDateRange,
  formatExhibitionTitle,
  getExhibitionStatus,
  getPlace,
} from '@/lib/format';
import type { WishlistItem } from '@/lib/wishlist-api';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  item: WishlistItem;
};

function formatWishlistedAt(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '.');
}

export function WishlistRecordCard({ item }: Props) {
  const [flipped, setFlipped] = useState(false);
  const place = getPlace({ ...item, address: null });
  const title = formatExhibitionTitle(item.title);
  const status = getExhibitionStatus(item.startDate, item.endDate);

  return (
    <button
      type="button"
      className="visit-ticket"
      onClick={() => setFlipped((v) => !v)}
      aria-label={flipped ? `${title} 찜 카드 닫기` : `${title} 찜 상세 보기`}
      aria-pressed={flipped}
    >
      <div
        className={`visit-ticket-inner ${flipped ? 'visit-ticket-inner--flipped' : ''}`}
      >
        <div className="visit-ticket-face visit-ticket-front">
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
            <Heart className="size-4 shrink-0 fill-red-500 text-red-500" aria-hidden />
            <span className="line-clamp-1">{place ?? '장소 정보 없음'}</span>
          </p>
        </div>

        <div className="visit-ticket-face visit-ticket-back">
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden text-center">
            <span
              className={`mx-auto inline-block rounded-full px-2 py-0.5 text-xs ${status.color}`}
            >
              {status.label}
            </span>
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug">{title}</h2>
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
    </button>
  );
}
