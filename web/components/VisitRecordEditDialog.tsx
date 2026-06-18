'use client';

import { uploadVisitPhoto } from '@/lib/upload-api';
import { updateVisit, type VisitItem } from '@/lib/visit-api';
import { Star } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type Props = {
  open: boolean;
  visit: VisitItem;
  onClose: () => void;
  onSaved: (next: VisitItem) => void;
};

const toDateInputValue = (iso: string) => iso.slice(0, 10);

const ALLOWED_PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const VisitRecordEditDialog = ({
  open,
  visit,
  onClose,
  onSaved,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [visitedAt, setVisitedAt] = useState(toDateInputValue(visit.visitedAt));
  const [rating, setRating] = useState<number | null>(visit.rating ?? null);
  const [note, setNote] = useState(visit.note ?? '');
  const [isPublic, setIsPublic] = useState(visit.isPublic);
  const [photoUrl, setPhotoUrl] = useState(visit.photoUrl ?? '');
  const [photoPreview, setPhotoPreview] = useState(visit.photoUrl ?? '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setVisitedAt(toDateInputValue(visit.visitedAt));
    setRating(visit.rating ?? null);
    setNote(visit.note ?? '');
    setIsPublic(visit.isPublic);
    setPhotoUrl(visit.photoUrl ?? '');
    setPhotoPreview(visit.photoUrl ?? '');
    setError('');
    setSubmitting(false);
    setPhotoUploading(false);
    setDragOver(false);
  }, [open, visit]);

  if (!open) return null;

  const applyPhotoFile = async (file: File) => {
    if (!ALLOWED_PHOTO_MIME.includes(file.type)) {
      setError('지원하지 않는 파일 형식입니다. jpeg, png, webp만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('파일 크기가 너무 큽니다. 최대 5MB까지 업로드할 수 있습니다.');
      return;
    }
    setError('');
    setPhotoUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    try {
      const { url } = await uploadVisitPhoto(file);
      setPhotoUrl(url);
      setPhotoPreview(url);
    } catch (err: unknown) {
      setPhotoUrl('');
      setPhotoPreview('');
      setError(err instanceof Error ? err.message : '사진 업로드에 실패했습니다.');
    } finally {
      URL.revokeObjectURL(localPreview);
      setPhotoUploading(false);
    }
  };

  const onPhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      void applyPhotoFile(file);
    }
  };

  const onPhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void applyPhotoFile(file);
    }
  };

  const onRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoPreview('');
    setError('');
  };

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (submitting || photoUploading) return;

    setSubmitting(true);
    setError('');

    try {
      const trimmedPhoto = photoUrl.trim();
      const visitedAtIso = visitedAt
        ? new Date(`${visitedAt}T12:00:00`).toISOString()
        : visit.visitedAt;

      const body: {
        visitedAt?: string;
        note?: string;
        rating?: number;
        isPublic?: boolean;
        photoUrl?: string;
      } = {
        isPublic,
        visitedAt: visitedAtIso,
      };

      if (note.trim()) {
        body.note = note.trim();
      } else {
        body.note = '';
      }

      if (rating != null) {
        body.rating = rating;
      }

      if (trimmedPhoto) {
        body.photoUrl = trimmedPhoto;
      } else {
        body.photoUrl = '';
      }

      await updateVisit(visit.visitId, body);

      onSaved({
        ...visit,
        visitedAt: visitedAtIso,
        note: note.trim() || null,
        rating: rating ?? null,
        isPublic,
        photoUrl: trimmedPhoto || null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visit-edit-dialog-title"
      onClick={() => !submitting && !photoUploading && onClose()}
    >
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h2 id="visit-edit-dialog-title" className="text-lg font-semibold text-muted">
          관람 기록 수정
        </h2>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="visit-edit-date" className="text-sm font-medium text-muted">
              관람일
            </label>
            <input
              type="date"
              id="visit-edit-date"
              name="visitedAt"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted">별점 (선택)</span>
            <div className="flex items-center gap-0.5" role="group" aria-label="별점">
              {[1, 2, 3, 4, 5].map((value) => {
                const filled = rating != null && value <= rating;
                return (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setRating(rating === value ? null : value)}
                    className="rounded p-1 transition-colors hover:bg-amber-50"
                    aria-label={`${value}점`}
                    aria-pressed={filled}
                  >
                    <Star
                      className={`size-7 ${
                        filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="visit-edit-note" className="text-sm font-medium text-muted">
              간단한 후기
            </label>
            <textarea
              id="visit-edit-note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted">관람 사진 (선택)</span>
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onPhotoDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center text-sm transition-colors ${
                dragOver
                  ? 'border-sky-400 bg-sky-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              {photoUploading ? (
                <p className="text-muted">업로드 중…</p>
              ) : photoPreview ? (
                <img
                  src={photoPreview}
                  alt=""
                  className="max-h-32 w-full rounded object-contain"
                />
              ) : (
                <p className="text-muted">
                  사진을 끌어다 놓거나 클릭해서 선택
                  <br />
                  <span className="text-xs">jpeg · png · webp · 최대 5MB</span>
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={onPhotoInputChange}
            />
            {photoPreview && !photoUploading ? (
              <button
                type="button"
                onClick={onRemovePhoto}
                className="text-xs font-medium text-red-600"
              >
                사진 제거
              </button>
            ) : null}
          </div>
          <div className="flex flex-row items-center gap-2">
            <label htmlFor="visit-edit-public" className="text-sm font-medium text-muted">
              공개 여부
            </label>
            <input
              type="checkbox"
              id="visit-edit-public"
              name="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          </div>
          {error ? <p className="text-error">{error}</p> : null}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => !submitting && !photoUploading && onClose()}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || photoUploading}
              className="btn-primary"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
