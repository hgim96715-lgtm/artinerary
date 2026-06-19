'use client';

import { formatDate } from '@/lib/format';
import { getNotice, type NoticeDetail } from '@/lib/notice-api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const noticeDate = (item: NoticeDetail) =>
  formatDate(item.publishedAt ?? item.createdAt);

export default function MyPageNoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const noticeId = Number(id);

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isFinite(noticeId)) {
      setError('공지사항을 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        setNotice(await getNotice(noticeId));
      } catch (err: unknown) {
        setNotice(null);
        setError(
          err instanceof Error ? err.message : '공지를 불러오지 못했습니다.',
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [noticeId]);

  if (loading) {
    return <p className="text-muted">불러오는 중…</p>;
  }

  if (error || !notice) {
    return (
      <div className="space-y-4">
        <Link href="/mypage/notices" className="link-back">
          <ArrowLeft className="size-4" aria-hidden />
          <span>공지 목록</span>
        </Link>
        <p className="text-error">{error || '공지사항을 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <article className="space-y-4">
      <Link href="/mypage/notices" className="link-back">
        <ArrowLeft className="size-4" aria-hidden />
        <span>공지 목록</span>
      </Link>

      <header className="space-y-2 border-b border-slate-200 pb-4 dark:border-slate-700">
        <h2 className="text-lg font-bold text-amber-950 dark:text-amber-50">
          {notice.title}
        </h2>
        <time
          className="text-muted text-sm"
          dateTime={notice.publishedAt ?? notice.createdAt}
        >
          {noticeDate(notice)}
        </time>
      </header>

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {notice.body}
      </div>
    </article>
  );
}