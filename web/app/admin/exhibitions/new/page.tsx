'use client';

import { adminMe, createExhibition } from '@/lib/admin-api';
import { AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminExhibitionNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [venueName, setVenueName] = useState('');
  const [area, setArea] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        await adminMe();
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
    }
    checkAuth();
  }, [router]);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (startDate > endDate) {
        setError('시작일이 종료일보다 이후일 수 없습니다.');
        setSubmitting(false);
        return;
      }

      await createExhibition({
        title: title.trim(),
        startDate,
        endDate,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        venueName: venueName.trim() || undefined,
        area: area.trim() || undefined,
        isVisible,
      });
      router.push('/admin/exhibitions');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('등록에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted">확인 중…</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/exhibitions" className="link-back">
        <AlignLeft className="size-4" />
        <span>전시 목록</span>
      </Link>
      <h1 className="page-title">전시 등록(MANUAL-신규)</h1>
      <form onSubmit={onSubmit} className="space-y-4">
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
          <div>
            <label htmlFor="startDate" className="label-field">
              시작일 <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              required
            />
            {startDate && endDate && startDate > endDate && (
              <p className="text-warn mt-2">시작일이 종료일보다 이후일 수 없습니다.</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="label-field">
              종료일 <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              required
            />
            {endDate && startDate && endDate < startDate && (
              <p className="text-warn mt-2">종료일이 시작일보다 이전일 수 없습니다.</p>
            )}
          </div>

          <div>
            <label htmlFor="venueName" className="label-field">
              장소명
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

        <div>
          <label htmlFor="description" className="label-field">
            설명
          </label>
          <textarea
            name="description"
            id="description"
            rows={8}
            placeholder="전시회에 대한 설명을 입력해 주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreviewError(false);
            }}
          />
          {imageUrl.trim() && !previewError ? (
            <img
              src={imageUrl.trim()}
              alt={`${title}이미지 미리보기`}
              className="mx-auto mt-3 max-h-64 rounded border bg-gray-50 object-contain"
              onError={() => setPreviewError(true)}
            />
          ) : imageUrl.trim() && previewError ? (
            <p className="text-warn mt-2">
              이미지를 불러올 수 없습니다. 이미지 URL을 확인해 주세요.
            </p>
          ) : (
            <p className="text-muted mt-2">미리보기가 없습니다.</p>
          )}
        </div>

        <div>
          <label htmlFor="sourceUrl" className="label-field">
            홈페이지 URL
          </label>
          <input
            type="url"
            id="sourceUrl"
            name="sourceUrl"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </div>

        <label htmlFor="isVisible" className="label-check">
          <input
            type="checkbox"
            id="isVisible"
            name="isVisible"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
          />
          공개
        </label>

        {error && <p className="text-error">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? '등록 중…' : '등록'}
        </button>
      </form>
    </div>
  );
}
