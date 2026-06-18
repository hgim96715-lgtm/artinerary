'use client';

import { VisitRecordCard } from '@/components/VisitRecordCard';
import { getMyVisits, type VisitItem } from '@/lib/visit-api';
import { isValidDateKey, toVisitDateKey } from '@/lib/visit-date';
import { notifyVisitsUpdated } from '@/lib/visit-sync';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

const MyPageVisitsContent = () => {
  const searchParams = useSearchParams();
  const dateFilter = searchParams.get('date');

  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeDateFilter =
    dateFilter && isValidDateKey(dateFilter) ? dateFilter : null;

  const filteredVisits = useMemo(() => {
    if (!activeDateFilter) return visits;
    return visits.filter(
      (v) => toVisitDateKey(v.visitedAt) === activeDateFilter,
    );
  }, [visits, activeDateFilter]);

  const onRemoveVisit = (visitId: number) => {
    setVisits((prev) => prev.filter((v) => v.visitId !== visitId));
    notifyVisitsUpdated();
  };

  const onUpdateVisit = (visitId: number, next: VisitItem) => {
    setVisits((prev) =>
      prev.map((v) => (v.visitId === visitId ? next : v)),
    );
    notifyVisitsUpdated();
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        setVisits(await getMyVisits());
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : '목록을 불러오지 못했습니다.',
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return <p className="text-muted">불러오는 중…</p>;
  }
  if (error) {
    return <p className="text-error">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-amber-950 dark:text-amber-50">
          관람 기록
        </h2>
        {activeDateFilter ? (
          <Link
            href="/mypage/visits"
            className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200"
          >
            전체 보기
          </Link>
        ) : null}
      </div>

      {visits.length === 0 ? (
        <div className="space-y-2">
          <p className="text-muted">관람 기록이 없습니다.</p>
          <Link href="/exhibitions" className="link-action">
            전시를 둘러보며 관람 기록을 남겨보세요
            <ArrowRight className="inline size-4" />
          </Link>
        </div>
      ) : filteredVisits.length === 0 ? (
        <p className="text-muted">이 날짜의 관람 기록이 없습니다.</p>
      ) : (
        <ul className="mypage-record-grid">
          {filteredVisits.map((visit) => (
            <li key={visit.visitId}>
              <VisitRecordCard
                visit={visit}
                onUpdate={onUpdateVisit}
                onDelete={onRemoveVisit}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function MyPageVisitsPage() {
  return (
    <Suspense fallback={<p className="text-muted">불러오는 중…</p>}>
      <MyPageVisitsContent />
    </Suspense>
  );
}
