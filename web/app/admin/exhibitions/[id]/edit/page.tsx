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
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
        router.replace('/admin/login');
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
      <Link
        href="/admin/exhibitions"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
      >
        <AlignLeft className="size-4" />
        <span>전시 목록</span>
      </Link>

      <header>
        <h1 className="text-2xl font-bold">
          {loading ? '불러오는 중…' : `${title} 수정`}
        </h1>
      </header>

      {loading ? (
        <p className="text-sm text-gray-500">전시 정보를 불러오는 중입니다.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={8}
              placeholder="전시회에 대한 설명을 입력해 주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="sourceUrl"
              className="block text-sm font-medium mb-1"
            >
              홈페이지 URL
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              placeholder="전시 홈페이지 URL을 입력해주세요"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <label
            htmlFor="isVisible"
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              id="isVisible"
              name="isVisible"
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="size-4"
            />
            공개
          </label>

          {(message || error) && (
            <div aria-live="polite" className="space-y-1">
              {message && (
                <p className="text-green-600 text-sm">{message}</p>
              )}
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {saving ? '저장 중…' : '저장'}
          </button>
        </form>
      )}
    </div>
  );
}
