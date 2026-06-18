'use client';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VisitRecordEditDialog } from '@/components/VisitRecordEditDialog';
import { formatExhibitionTitle, getPlace } from '@/lib/format';
import { buildExhibitionHref } from '@/lib/return-path';
import { deleteVisit, type VisitItem } from '@/lib/visit-api';
import { CalendarDays, Pencil, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export const VisitRecordCard = ({ visit, onUpdate, onDelete }: Props) => {
  const pathname = usePathname();
  const [flipped, setFlipped] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

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

  const stopFlip = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const onOpenEdit = (e: MouseEvent) => {
    stopFlip(e);
    setActionError('');
    setEditOpen(true);
  };

  const onOpenDelete = (e: MouseEvent) => {
    stopFlip(e);
    setActionError('');
    setDeleteOpen(true);
  };

  const onConfirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setActionError('');
    try {
      await deleteVisit(visit.visitId);
      onDelete?.(visit.visitId);
      setDeleteOpen(false);
      setFlipped(false);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : '삭제에 실패했습니다.',
      );
    } finally {
      setDeleting(false);
    }
  };

  const onSaved = (next: VisitItem) => {
    onUpdate?.(visit.visitId, next);
    setEditOpen(false);
  };

  return (
    <>
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
              <span
                className={`visit-ticket-stamp visit-ticket-stamp--${stamp.variant}`}
                aria-hidden
              >
                {stamp.label}
              </span>
            </div>
            <p className="visit-ticket-date">관람 {visitedLabel}</p>
          </div>

          <div
            className="visit-ticket-face visit-ticket-back visit-ticket-flip"
            onClick={onFlip}
            onKeyDown={onFlipKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`${title} 관람 기록 닫기`}
          >
            <div className="visit-ticket-back-thumb">
              {posterSrc ? (
                <img src={posterSrc} alt="" />
              ) : (
                <div className="visit-ticket-back-thumb-placeholder">{title}</div>
              )}
              <span className="visit-ticket-back-date-badge">
                <CalendarDays className="size-3 text-sky-400" aria-hidden />
                관람 {visitedLabel}
              </span>
            </div>

            <div className="visit-ticket-back-body">
              <div className="visit-ticket-back-meta">
                <h2 className="visit-ticket-back-title">{title}</h2>
                {place ? (
                  <p className="visit-ticket-back-place">{place}</p>
                ) : null}
                {visit.rating != null ? (
                  <StarRating rating={visit.rating} />
                ) : null}
              </div>
              {visit.note ? (
                <div
                  className="visit-ticket-back-note-wrap"
                  onClick={stopFlip}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <p className="visit-ticket-back-note">{visit.note}</p>
                </div>
              ) : (
                <p className="visit-ticket-back-note-empty">후기 없음</p>
              )}
            </div>

            <div className="visit-ticket-back-footer space-y-2">
              <div
                className="visit-ticket-back-actions"
                onClick={stopFlip}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={onOpenEdit}
                  className="visit-ticket-back-action"
                  aria-label={`${title} 관람 기록 수정`}
                >
                  <Pencil className="size-3" aria-hidden />
                  수정
                </button>
                <button
                  type="button"
                  onClick={onOpenDelete}
                  className="visit-ticket-back-action visit-ticket-back-action--danger"
                  aria-label={`${title} 관람 기록 삭제`}
                >
                  <Trash2 className="size-3" aria-hidden />
                  삭제
                </button>
              </div>
              {actionError ? (
                <p className="text-error px-1 text-center text-xs">{actionError}</p>
              ) : null}
              {visit.canOpenDetail ? (
                <Link
                  href={buildExhibitionHref(visit.id, pathname)}
                  className="visit-ticket-back-link"
                  onClick={stopFlip}
                >
                  전시 상세 보기 →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <VisitRecordEditDialog
        open={editOpen}
        visit={visit}
        onClose={() => setEditOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="관람 기록을 삭제할까요?"
        description="삭제하면 복구할 수 없어요 😭"
        confirmLabel="삭제"
        cancelLabel="취소"
        confirming={deleting}
        confirmingLabel="삭제 중…"
        confirmClassName="btn-primary bg-red-600 text-white hover:opacity-90"
        onConfirm={() => void onConfirmDelete()}
        onCancel={() => !deleting && setDeleteOpen(false)}
      />
    </>
  );
};
