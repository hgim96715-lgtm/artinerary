'use client';

import { formatExhibitionTitle, getPlace } from '@/lib/format';
import type { VisitItem } from '@/lib/visit-api';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  visit: VisitItem;
};

function formatVisitedAt(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '.');
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`size-3.5 ${
            n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function VisitRecordCard({ visit }: Props) {
  const [flipped, setFlipped] = useState(false);
  const place = getPlace({ ...visit, address: null });
  const title = formatExhibitionTitle(visit.title);

  function onFlip() {
    setFlipped((v) => !v);
  }

  return (
    <button
      type="button"
      className="visit-ticket"
      onClick={onFlip}
      aria-label={flipped ? `${title} 관람 기록 닫기` : `${title} 관람 기록 보기`}
      aria-pressed={flipped}
    >
      <div
        className={`visit-ticket-inner ${flipped ? 'visit-ticket-inner--flipped' : ''}`}
      >
        <div className="visit-ticket-face visit-ticket-front">
          <div className="visit-ticket-poster">
            {visit.imageUrl ? (
              <img src={visit.imageUrl} alt="" />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm font-medium text-gray-500">
                {title}
              </div>
            )}
          </div>
          <p className="visit-ticket-date">관람 {formatVisitedAt(visit.visitedAt)}</p>
        </div>

        <div className="visit-ticket-face visit-ticket-back">
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden text-center">
            <p className="text-xs font-medium text-muted">관람일</p>
            <p className="text-sm font-semibold">{formatVisitedAt(visit.visitedAt)}</p>
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug">{title}</h2>
            {place && <p className="line-clamp-1 text-xs text-muted">{place}</p>}
            {visit.rating != null && <StarRating rating={visit.rating} />}
            {visit.note ? (
              <p className="line-clamp-4 flex-1 text-left text-xs leading-relaxed text-gray-700">
                {visit.note}
              </p>
            ) : (
              <p className="text-xs text-muted">후기 없음</p>
            )}
          </div>
          <Link
            href={`/exhibitions/${visit.id}`}
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
