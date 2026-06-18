'use client';

import { VisitRecordCard } from '@/components/VisitRecordCard';
import { getMyVisits, type VisitItem } from '@/lib/visit-api';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MyPageVisitsPage() {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const onRemoveVisit=(visitId:number)=>{
    setVisits((prev)=>prev.filter((visit)=>visit.id !== visitId));
  }

  const onUpdateVisit=(visitId:number,next:VisitItem)=>{
    setVisits((prev)=>prev.map((visit)=>visit.id === visitId ? next : visit));
  }

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
      <h2 className="text-lg font-semibold">관람 기록</h2>

      {visits.length === 0 ? (
        <div className="space-y-2">
          <p className="text-muted">관람 기록이 없습니다.</p>
          <Link href="/exhibitions" className="link-action">
            전시를 둘러보며 관람 기록을 남겨보세요
            <ArrowRight className="inline size-4" />
          </Link>
        </div>
      ) : (
        <ul className="mypage-record-grid">
          {visits.map((visit) => (
            <li key={visit.visitId}>
              <VisitRecordCard visit={visit} onUpdate={onUpdateVisit} onDelete={onRemoveVisit} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
