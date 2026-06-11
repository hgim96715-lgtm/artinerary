'use client';

import { adminExhibition, adminMe, patchExhibition } from '@/lib/admin-api';
import { formatExhibitionTitle } from '@/lib/format';
import { AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminExhibitionEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    async function loadExhibition() {
      setLoading(true);
      setError('');
      try {
        await adminMe();
        const row = await adminExhibition(Number(id));
        setTitle(formatExhibitionTitle(row.title));
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
    }
    loadExhibition();
  }, [id, router]);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await patchExhibition(Number(id), {
        description: description || undefined,
        sourceUrl: sourceUrl || undefined,
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

      <header>
        <h1 className="page-title">
          {loading ? '불러오는 중…' : `${title} 수정`}
        </h1>
      </header>

      {loading ? (
        <p className="text-muted">전시 정보를 불러오는 중입니다.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="label-field">
              설명
            </label>
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
              placeholder="전시 홈페이지 URL을 입력해주세요"
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

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? '저장 중…' : '저장'}
          </button>
        </form>
      )}
    </div>
  );
}
