'use client';

import { AdminActivityCard } from '@/components/AdminActivityCard';
import {
  adminTodayActivity,
  type AdminExhibitionActivity,
} from '@/lib/admin-api';
import { formatExhibitionTitle, formatToday, truncateWithEllipsis } from '@/lib/format';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });

const ActivityGrid = ({ children }: { children: ReactNode }) => (
  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
);

export default function AdminActivityPage() {
  const [data, setData] = useState<AdminExhibitionActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true);
      setError('');
      try {
        setData(await adminTodayActivity());
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류로 불러오기 실패',
        );
      } finally {
        setLoading(false);
      }
    };
    void loadActivity();
  }, []);

  if (loading) return <p className="text-muted">데이터를 불러오는 중입니다.</p>;
  if (error) return <p className="text-error">{error}</p>;
  if (!data) return null;

  const { summary } = data;
  const reviews = data.visits.filter((v) => v.note?.trim());
  const isEmpty =
    summary.signups === 0 &&
    summary.wishlists === 0 &&
    summary.visits === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">오늘 활동</h2>
        <p className="text-muted text-sm">{formatToday()}</p>
      </div>

      <p className="text-muted text-sm" role="status">
        신규 가입 {summary.signups}명 · 찜 {summary.wishlists}건 · 방문{' '}
        {summary.visits}건 · 리뷰 {summary.reviews}건
      </p>

      {isEmpty ? (
        <p className="text-muted">오늘 사용자 활동이 없습니다.</p>
      ) : (
        <div className="space-y-8">
          {reviews.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-medium">리뷰</h3>
              <ActivityGrid>
                {reviews.map((v) => (
                  <li key={v.id}>
                    <AdminActivityCard
                      nickname={v.nickname}
                      userId={v.userId}
                      time={formatTime(v.updatedAt)}
                    >
                      <Link
                        href={`/exhibitions/${v.exhibitionId}`}
                        className="link-action line-clamp-2 text-xs leading-snug"
                      >
                        {formatExhibitionTitle(v.exhibitionTitle)}
                      </Link>
                      {v.rating != null && (
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                          ★{v.rating}
                        </p>
                      )}
                      <p
                        className="text-muted text-xs"
                        title={v.note ?? undefined}
                      >
                        {truncateWithEllipsis(v.note ?? '', 20)}
                      </p>
                    </AdminActivityCard>
                  </li>
                ))}
              </ActivityGrid>
            </section>
          )}

          {data.wishlists.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-medium">찜</h3>
              <ActivityGrid>
                {data.wishlists.map((w) => (
                  <li key={w.id}>
                    <AdminActivityCard
                      nickname={w.nickname}
                      userId={w.userId}
                      time={formatTime(w.createdAt)}
                    >
                      <Link
                        href={`/exhibitions/${w.exhibitionId}`}
                        className="link-action line-clamp-2 text-xs leading-snug"
                      >
                        {formatExhibitionTitle(w.exhibitionTitle)}
                      </Link>
                    </AdminActivityCard>
                  </li>
                ))}
              </ActivityGrid>
            </section>
          )}

          {data.signups.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-medium">신규 가입</h3>
              <ActivityGrid>
                {data.signups.map((s) => (
                  <li key={s.id}>
                    <AdminActivityCard
                      nickname={s.nickname}
                      userId={s.id}
                      time={formatTime(s.createdAt)}
                    >
                      <p className="text-muted line-clamp-1 text-xs">{s.email}</p>
                    </AdminActivityCard>
                  </li>
                ))}
              </ActivityGrid>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
