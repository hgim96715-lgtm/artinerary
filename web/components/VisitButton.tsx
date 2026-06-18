'use client';

import { ExhibitionVisitHistory } from '@/lib/me-status-api';
import { buildLoginHref } from '@/lib/login-redirect';
import { upsertVisit } from '@/lib/visit-api';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState,useRef } from 'react';
import { uploadVisitPhoto } from '@/lib/upload-api';

type Props = {
  exhibitionId: number;
  canUse: boolean;
  visit: ExhibitionVisitHistory | null;
  onVisitChange: (next: ExhibitionVisitHistory | null) => void;
};

function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

const ALLOWED_PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;


export function VisitButton({
  exhibitionId,
  canUse,
  visit,
  onVisitChange,
}: Props) {
  const pathname = usePathname();
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [visitedAt, setVisitedAt] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  function openModal() {
    const today = new Date().toISOString().slice(0, 10);
    if (visit) {
      setVisitedAt(toDateInputValue(visit.visitedAt));
      setRating(visit.rating ?? null);
      setNote(visit.note ?? '');
      setIsPublic(visit.isPublic);
      setPhotoUrl(visit.photoUrl ?? '');
      setPhotoPreview(visit.photoUrl ?? '');
    } else {
      setVisitedAt(today);
      setRating(null);
      setNote('');
      setIsPublic(false);
      setPhotoUrl('');
      setPhotoPreview('');
    }
    setError('');
    setOpen(true);
  }

  const applyPhotoFile=async(file:File)=>{
    if(!ALLOWED_PHOTO_MIME.includes(file.type)){
        setError('지원하지 않는 파일 형식입니다. jpeg, png, webp만 업로드할 수 있습니다.');
        return;
    }
    if(file.size>MAX_PHOTO_BYTES){
        setError('파일 크기가 너무 큽니다. 최대 5MB까지 업로드할 수 있습니다.');
        return;
    }
    setError('');
    setPhotoUploading(true);

    const localPreview=URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    try{
        const {url}=await uploadVisitPhoto(file);
        setPhotoUrl(url);
        setPhotoPreview(url);
    }catch(err:unknown){
        setPhotoUrl('');
        setPhotoPreview('');
        setError(err instanceof Error ? err.message : '사진 업로드에 실패했습니다.');
    }finally{
        URL.revokeObjectURL(localPreview);
        setPhotoUploading(false);
    }
  };

  const onPhotoInputChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    e.target.value='';
    if(file){
        applyPhotoFile(file);
    }
  };

  const onPhotoDrop=(e:React.DragEvent)=>{
    e.preventDefault();
    setDragOver(true);
    const file=e.dataTransfer.files?.[0];
    if(file){
        applyPhotoFile(file);
    }
  };

  const onRemovePhoto=()=>{
    setPhotoUrl('');
    setPhotoPreview('');
    setError('');
  }



  const submit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!canUse || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const body: {
        visitedAt?: string;
        note?: string;
        rating?: number;
        isPublic?: boolean;
        photoUrl?: string;
      } = {
        isPublic,
      };
      const trimmedPhoto=photoUrl.trim();
      if(trimmedPhoto){
        body.photoUrl=trimmedPhoto;
      }else if (visit){
        body.photoUrl='';
      }
      const visitedAtIso = visitedAt
        ? new Date(`${visitedAt}T12:00:00`).toISOString()
        : new Date().toISOString();
      if (visitedAt) {
        body.visitedAt = visitedAtIso;
      }
      if (note.trim()) {
        body.note = note.trim();
      }
      if (rating != null) {
        body.rating = rating;
      }
      const result = await upsertVisit(exhibitionId, body);
      onVisitChange({
        visitId: result.visitId,
        visitedAt: visitedAtIso,
        note: note.trim() || null,
        rating: rating ?? null,
        isPublic,
        photoUrl:trimmedPhoto|| null,
      });
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('오류가 발생했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!canUse) {
    return (
      <p className="text-sm text-muted">
        <Link href={buildLoginHref(pathname)} className="link-action">
          로그인
        </Link>{' '}
        하면 방문 관람 기록을 남길 수 있습니다.
        <ArrowRight className="inline-block size-4" />
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          {visit ? '방문 관람 기록 수정' : '다녀왔어요~ 평가 남기기'}
        </button>
        {visit && (
          <p className="text-xs text-muted">
            {visit.rating != null && `별점 ${visit.rating} · `}
            관람일 {toDateInputValue(visit.visitedAt)}
          </p>
        )}

        {error && <p className="text-error">{error}</p>}
      </div>
      {open && (
        <div
          className="dialog-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visit-dialog-title"
          onClick={() => !submitting && setOpen(false)}
        >
          <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
            <h2
              id="visit-dialog-title"
              className="text-lg font-semibold text-muted"
            >
              {visit ? '방문 관람 기록 수정' : '다녀왔어요~ 평가 남기기'}
            </h2>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="visitedAt"
                  className="text-sm font-medium text-muted"
                >
                  관람일
                </label>
                <input
                  type="date"
                  id="visitedAt"
                  name="visitedAt"
                  value={visitedAt}
                  onChange={(e) => setVisitedAt(e.target.value)}
                  className="input-text"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">
                  별점 (선택)
                </span>
                <div
                  className="flex items-center gap-0.5"
                  role="group"
                  aria-label="별점"
                >
                  {[1, 2, 3, 4, 5].map((value) => {
                    const filled = rating != null && value <= rating;
                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() =>
                          setRating(rating === value ? null : value)
                        }
                        className="rounded p-1 transition-colors hover:bg-amber-50"
                        aria-label={`${value}점`}
                        aria-pressed={filled}
                      >
                        <Star
                          className={`size-7 ${
                            filled
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="note" className="text-sm font-medium text-muted">
                  간단한 후기
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-text"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted">
                  관람 사진 (선택)
                </span>
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
                      ? 'border-rose-400 bg-rose-50'
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
                {photoPreview && !photoUploading && (
                  <button
                    type="button"
                    onClick={onRemovePhoto}
                    className="text-xs font-medium text-red-600"
                  >
                    사진 제거
                  </button>
                )}
              </div>
              <div className="flex flex-row items-center gap-2">
                <label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-muted"
                >
                  공개 여부
                </label>
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="input-checkbox"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => !submitting && setOpen(false)}
                  className="btn-primary btn-secondary"
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
      )}
    </>
  );
}

export default VisitButton;
