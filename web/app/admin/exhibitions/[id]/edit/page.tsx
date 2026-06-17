'use client';

import {
  adminExhibition,
  adminMe,
  generateExhibitionDescription,
  patchExhibition,
} from '@/lib/admin-api';
import { formatExhibitionTitle } from '@/lib/format';
import { SourceBadge } from '@/components/SourceBadge';
import type { ExhibitionSource } from '@/lib/types/exhibition';
import { VisibleBadge } from '@/components/VisibleBadge';
import { AlignLeft, CalendarIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const toDateInput = (iso: string) => iso.slice(0, 10);

type DateInputProps = {
  id: string;
  name: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
};

const DateInput = ({
  id,
  name,
  label,
  value,
  onChange,
  min,
  max,
  required,
}: DateInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
  };

  return (
    <div>
      <label htmlFor={id} className="label-field">
        {label}
      </label>
      <div className="input-date-wrap">
        <input
          ref={inputRef}
          type="date"
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          required={required}
        />
        <button
          type="button"
          className="input-date-btn"
          onClick={openPicker}
          aria-label="달력 열기"
        >
          <CalendarIcon className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default function AdminExhibitionEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venueName, setVenueName] = useState('');
  const [area, setArea] = useState('');
  const [source, setSource] = useState<ExhibitionSource>('API');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [generating, setGenerating] = useState(false);

  const dateInvalid =
    Boolean(startDate && endDate && startDate > endDate);

  const onGenerateDescription = async () => {
    if (description.trim() && !confirm('기존 설명을 덮어쓸까요?')) return;
    setGenerating(true);
    setError('');
    try {
      const { description: generated } = await generateExhibitionDescription(
        Number(id),
      );
      setDescription(generated);
      setMessage('AI 소개를 생성했어요. 확인 후 저장해 주세요.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI 생성 실패');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const loadExhibition = async () => {
      setLoading(true);
      setError('');
      try {
        await adminMe();
        const row = await adminExhibition(Number(id));
        setTitle(formatExhibitionTitle(row.title));
        setStartDate(toDateInput(row.startDate));
        setEndDate(toDateInput(row.endDate));
        setVenueName(row.venueName ?? '');
        setArea(row.area ?? '');
        setSource(row.source);
        setDescription(row.description ?? '');
        setSourceUrl(row.sourceUrl ?? '');
        setIsVisible(row.isVisible);
        setImageUrl(row.imageUrl ?? '');
        setPreviewError(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    void loadExhibition();
  }, [id, router]);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    if (dateInvalid) {
      setError('시작일이 종료일보다 이후일 수 없습니다.');
      return;
    }

    setSaving(true);
    try {
      await patchExhibition(Number(id), {
        title: title.trim(),
        startDate,
        endDate,
        venueName: venueName.trim() || undefined,
        area: area.trim() || undefined,
        description: description.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        isVisible,
        imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
      });
      setMessage('저장되었습니다.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('수정에 실패했습니다.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/exhibitions" className="link-back">
        <AlignLeft className="size-4" />
        <span>전시 목록</span>
      </Link>

      {loading ? (
        <>
          <h1 className="page-title">불러오는 중…</h1>
          <p className="text-muted">전시 정보를 불러오는 중입니다.</p>
        </>
      ) : (
        <>
          <header className="space-y-2">
            <h1 className="page-title">{title || '전시'} 수정</h1>
            <div className="flex flex-wrap items-center gap-2">
              <SourceBadge source={source} />
              <VisibleBadge isVisible={isVisible} />
            </div>
          </header>

          <form
            onSubmit={onSubmit}
            className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <div className="order-2 space-y-4 lg:order-1">
              <div>
                <label htmlFor="title" className="label-field">
                  제목 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DateInput
                  id="startDate"
                  name="startDate"
                  label={
                    <>
                      시작일 <span className="text-red-600">*</span>
                    </>
                  }
                  value={startDate}
                  onChange={setStartDate}
                  max={endDate || undefined}
                  required
                />

                <DateInput
                  id="endDate"
                  name="endDate"
                  label={
                    <>
                      종료일 <span className="text-red-600">*</span>
                    </>
                  }
                  value={endDate}
                  onChange={setEndDate}
                  min={startDate || undefined}
                  required
                />

                <div>
                  <label htmlFor="venueName" className="label-field">
                    장소
                  </label>
                  <input
                    type="text"
                    id="venueName"
                    name="venueName"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="area" className="label-field">
                    지역(시·도)
                  </label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>

              {dateInvalid && (
                <p className="text-warn">
                  시작일이 종료일보다 이후일 수 없습니다.
                </p>
              )}

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="description" className="label-field !mb-0">
                    설명
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent-border bg-transparent px-3 py-1.5 text-sm text-accent hover:bg-accent/10 disabled:opacity-50"
                    onClick={onGenerateDescription}
                    disabled={generating || saving}
                  >
                    <Sparkles className="size-4 shrink-0" aria-hidden />
                    {generating ? '생성 중…' : 'AI 소개 생성'}
                  </button>
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={8}
                  placeholder="전시회에 대한 설명을 입력해 주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="sourceUrl" className="label-field">
                  홈페이지 URL
                </label>
                <input
                  id="sourceUrl"
                  name="sourceUrl"
                  type="url"
                  placeholder="https://"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="label-field">
                  이미지 URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                />
              </div>

              <label htmlFor="isVisible" className="label-check">
                <input
                  id="isVisible"
                  name="isVisible"
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                />
                공개
              </label>

              {(message || error) && (
                <div aria-live="polite" className="space-y-1">
                  {message && <p className="text-success">{message}</p>}
                  {error && <p className="text-error">{error}</p>}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || generating || dateInvalid}
                  className="btn-primary rounded-lg px-5 py-2.5"
                >
                  {saving ? '저장 중…' : '저장'}
                </button>
                <Link
                  href="/admin/exhibitions"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-foreground hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  취소
                </Link>
              </div>
            </div>

            <aside
              className="order-1 lg:sticky lg:top-8 lg:order-2"
              aria-label="포스터 미리보기"
            >
              <p className="label-field">포스터</p>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <div className="relative aspect-[3/4] w-full">
                  {imageUrl.trim() && !previewError ? (
                    <img
                      src={imageUrl.trim()}
                      alt={`${title} 포스터`}
                      className="absolute inset-0 h-full w-full object-contain p-2"
                      onError={() => setPreviewError(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                      <span className="text-2xl text-gray-400" aria-hidden>
                        ✦
                      </span>
                      <p className="text-sm font-medium leading-snug">
                        {title}
                      </p>
                      <p className="text-muted text-xs">
                        {imageUrl.trim() && previewError
                          ? '이미지를 불러올 수 없습니다'
                          : '이미지 URL을 입력하세요'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </form>
        </>
      )}
    </div>
  );
}
