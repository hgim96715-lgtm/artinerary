'use client';

import { formatExhibitionTitle, getPlace } from '@/lib/format';
import type { VisitItem } from '@/lib/visit-api';
import { CalendarDays, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';

type Props = {
  visit: VisitItem;
  onUpdate?: (visitId: number, next: VisitItem) => void;
  onDelete?: (visitId: number) => void;
};

const formatVisitedAt = (iso: string) => {
  return iso.slice(0, 10).replace(/-/g, '.');
};

const getVisitStamp = (visit: VisitItem) => ({
  label: '관람완료!',
  variant:
    visit.isEnded || !visit.isExhibitionVisible
      ? ('done-completed' as const)
      : ('done-in-progress' as const),
});

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div
      className="flex items-center justify-center gap-0.5"
      aria-label={`별점 ${rating}점`}
    >
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
};

export const VisitRecordCard = ({ visit }: Props) => {
  const [flipped, setFlipped] = useState(false);
  const place = getPlace({ ...visit, address: null });
  const title = formatExhibitionTitle(visit.title);
  const posterSrc = visit.photoUrl ?? visit.imageUrl;
  const stamp = getVisitStamp(visit);
  const visitedLabel = formatVisitedAt(visit.visitedAt);

  const onFlip = () => setFlipped((v) => !v);

  const onFlipKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  };

  const onFlipClick = (e: MouseEvent) => {
    e.stopPropagation();
    onFlip();
  };

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
            flipped ? `${title} 관람 기록 닫기` : `${title} 관람 기록 보기`
          }
          aria-pressed={flipped}
        >
          <div className="visit-ticket-poster">
            {posterSrc ? (
              <img src={posterSrc} alt="" />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm font-medium text-gray-500">
                {title}
              </div>
            )}
          </div>
          <p className="visit-ticket-date">관람 {visitedLabel}</p>
          <span
            className={`visit-ticket-stamp visit-ticket-stamp--${stamp.variant}`}
            aria-hidden
          >
            {stamp.label}
          </span>
        </div>

        <div className="visit-ticket-face visit-ticket-back">
          <div
            className="visit-ticket-back-thumb visit-ticket-flip"
            onClick={onFlipClick}
            onKeyDown={onFlipKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`${title} 관람 기록 닫기`}
          >
            {posterSrc ? (
              <img src={posterSrc} alt="" />
            ) : (
              <div className="visit-ticket-back-thumb-placeholder">{title}</div>
            )}
            <span className="visit-ticket-back-date-badge">
              <CalendarDays className="size-3 text-rose-400" aria-hidden />
              관람 {visitedLabel}
            </span>
          </div>

          <div
            className="visit-ticket-back-body visit-ticket-flip"
            onClick={onFlipClick}
            onKeyDown={onFlipKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`${title} 관람 기록 닫기`}
          >
            <h2 className="visit-ticket-back-title">{title}</h2>
            {place ? (
              <p className="visit-ticket-back-place">{place}</p>
            ) : null}
            {visit.rating != null ? <StarRating rating={visit.rating} /> : null}
            {visit.note ? (
              <p className="visit-ticket-back-note">{visit.note}</p>
            ) : (
              <p className="visit-ticket-back-note-empty">후기 없음</p>
            )}
          </div>

          {visit.canOpenDetail ? (
            <div className="visit-ticket-back-footer">
              <Link
                href={`/exhibitions/${visit.id}`}
                className="visit-ticket-back-link"
                onClick={(e) => e.stopPropagation()}
              >
                전시 상세 보기 →
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
