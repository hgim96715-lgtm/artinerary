'use client';

import { AdminNoticeForm } from '@/components/AdminNoticeForm';
import type { AdminNoticeFormValues } from '@/components/AdminNoticeForm';
import { adminMe, adminNotice, patchNotice } from '@/lib/admin-api';
import { AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminNoticeEditPage() {
  const { id } = useParams<{ id: string }>();
  const noticeId = Number(id);
  const router = useRouter();

  const [values, setValues] = useState<AdminNoticeFormValues>({
    title: '',
    body: '',
    isPublished: false,
    isPinned: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isFinite(noticeId)) {
      setError('공지를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await adminMe();
        const notice = await adminNotice(noticeId);
        setValues({
          title: notice.title,
          body: notice.body,
          isPublished: notice.isPublished,
          isPinned: notice.isPinned,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : '불러오지 못했습니다.',
        );
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [noticeId, router]);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!Number.isFinite(noticeId)) return;

    setError('');
    setSubmitting(true);
    try {
      await patchNotice(noticeId, {
        title: values.title.trim(),
        body: values.body.trim(),
        isPublished: values.isPublished,
        isPinned: values.isPinned,
      });
      router.push('/admin/notices');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted">불러오는 중…</p>;
  }

  if (error && !values.title) {
    return (
      <div className="space-y-4">
        <Link href="/admin/notices" className="link-back">
          <AlignLeft className="size-4" aria-hidden />
          <span>공지 목록</span>
        </Link>
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/notices" className="link-back">
        <AlignLeft className="size-4" aria-hidden />
        <span>공지 목록</span>
      </Link>
      <h1 className="page-title">공지 수정</h1>
      <AdminNoticeForm
        values={values}
        onChange={setValues}
        onSubmit={onSubmit}
        error={error}
        submitting={submitting}
        submitLabel="저장"
        submittingLabel="저장 중…"
      />
    </div>
  );
}
