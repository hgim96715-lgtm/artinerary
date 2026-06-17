'use client';

import { AdminActivityCard } from '@/components/AdminActivityCard';
import { AdminExhibitionEditCard } from '@/components/AdminExhibitionEditCard';
import { FilterChip } from '@/components/FilterChip';
import {
  adminTodayActivity,
  type AdminExhibitionActivity,
} from '@/lib/admin-api';
import {
  formatExhibitionTitle,
  formatToday,
  truncateWithEllipsis,
} from '@/lib/format';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

type ActivityTab = 'reviews' | 'wishlists' | 'signups' | 'exhibitions';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });

const ActivityGrid = ({ children }: { children: ReactNode }) => (
  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
);

const TAB_LABELS: Record<ActivityTab, string> = {
  reviews: '리뷰',
  wishlists: '찜',
  signups: '신규 가입',
  exhibitions: '전시 수정',
};

export default function AdminActivityPage() {
  const [data, setData] = useState<AdminExhibitionActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<ActivityTab>('reviews');

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

  const tabCounts: Record<ActivityTab, number> = {
    reviews: summary.reviews,
    wishlists: summary.wishlists,
    signups: summary.signups,
    exhibitions: summary.exhibitionEdits,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">오늘 활동</h2>
        <p className="text-muted text-sm">{formatToday()}</p>
      </div>

      <p className="text-muted text-sm" role="status">
        신규 가입 {summary.signups}명 · 찜 {summary.wishlists}건 · 방문{' '}
        {summary.visits}건 · 리뷰 {summary.reviews}건 · 전시 수정{' '}
        {summary.exhibitionEdits}건
      </p>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as ActivityTab[]).map((key) => (
          <FilterChip
            key={key}
            as="button"
            active={tab === key}
            onClick={() => setTab(key)}
          >
            {TAB_LABELS[key]} ({tabCounts[key]})
          </FilterChip>
        ))}
      </div>

      {tab === 'reviews' &&
        (reviews.length === 0 ? (
          <p className="text-muted">오늘 리뷰가 없습니다.</p>
        ) : (
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
        ))}

      {tab === 'wishlists' &&
        (data.wishlists.length === 0 ? (
          <p className="text-muted">오늘 찜이 없습니다.</p>
        ) : (
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
        ))}

      {tab === 'signups' &&
        (data.signups.length === 0 ? (
          <p className="text-muted">오늘 신규 가입이 없습니다.</p>
        ) : (
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
        ))}

      {tab === 'exhibitions' &&
        (data.exhibitionEdits.length === 0 ? (
          <p className="text-muted">오늘 수정된 전시가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-muted text-xs">
              오늘 DB에 반영된 전시입니다. API 수집도 포함됩니다.
            </p>
            <ActivityGrid>
              {data.exhibitionEdits.map((e) => (
                <li key={e.id}>
                  <AdminExhibitionEditCard
                    item={e}
                    time={formatTime(e.updatedAt)}
                  />
                </li>
              ))}
            </ActivityGrid>
          </div>
        ))}
    </div>
  );
}
