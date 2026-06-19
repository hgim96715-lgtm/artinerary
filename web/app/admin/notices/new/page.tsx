'use client';

import { AdminNoticeForm } from '@/components/AdminNoticeForm';
import type { AdminNoticeFormValues } from '@/components/AdminNoticeForm';
import { adminMe, createNotice } from '@/lib/admin-api';
import { AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const emptyValues: AdminNoticeFormValues = {
  title: '',
  body: '',
  isPublished: false,
  isPinned: false,
};

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const [values, setValues] = useState<AdminNoticeFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await adminMe();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : '인증에 실패했습니다.',
        );
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    void checkAuth();
  }, [router]);

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createNotice({
        title: values.title.trim(),
        body: values.body.trim(),
        isPublished: values.isPublished,
        isPinned: values.isPinned,
      });
      router.push('/admin/notices');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted">확인 중…</p>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/notices" className="link-back">
        <AlignLeft className="size-4" aria-hidden />
        <span>공지 목록</span>
      </Link>
      <h1 className="page-title">공지 작성</h1>
      <AdminNoticeForm
        values={values}
        onChange={setValues}
        onSubmit={onSubmit}
        error={error}
        submitting={submitting}
        submitLabel="등록"
        submittingLabel="등록 중…"
      />
    </div>
  );
}
