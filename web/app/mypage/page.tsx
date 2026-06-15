'use client';

import { FilterChip } from '@/components/FilterChip';
import { WishlistRecordCard } from '@/components/WishlistRecordCard';
import { VisitRecordCard } from '@/components/VisitRecordCard';
import { me } from '@/lib/auth-api';
import { getMyWishlist, WishlistItem } from '@/lib/wishlist-api';
import { getMyVisits, VisitItem } from '@/lib/visit-api';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Tab = 'wishlist' | 'visit-history';

export default function MyPagePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [tab, setTab] = useState<Tab>('wishlist');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visits, setVisits] = useState<VisitItem[]>([]);

  useEffect(() => {
    async function loadMyPage() {
      setLoading(true);
      setError('');
      try {
        const user = await me();
        if (user.role !== 'USER') {
          router.replace('/');
          return;
        }
        setNickname(user.nickname);
        const [wishlist, visitList] = await Promise.all([
          getMyWishlist(),
          getMyVisits(),
        ]);
        setItems(wishlist);
        setVisits(visitList);
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
    void loadMyPage();
  }, [router]);

  if (loading) {
    return <p className="text-muted">불러오는 중…</p>;
  }
  if (error) {
    return <p className="text-error">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="page-title">안녕하세요👋 <br/> {nickname}님의 마이페이지</h1>
        <p className="text-muted">찜한 전시와 관람 기록을 확인할 수 있습니다.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          as="button"
          active={tab === 'wishlist'}
          onClick={() => setTab('wishlist')}
        >
          찜한 전시
        </FilterChip>
        <FilterChip
          as="button"
          active={tab === 'visit-history'}
          onClick={() => setTab('visit-history')}
        >
          관람 기록
        </FilterChip>
      </div>

      {tab === 'wishlist' &&
        (items.length === 0 ? (
          <div className="space-y-2">
            <p className="text-muted">찜한 전시가 없습니다.</p>
            <Link href="/exhibitions" className="link-action">
              전시 둘러보며 찜해보세요
              <ArrowRight className="inline size-4" />
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <WishlistRecordCard item={item} />
              </li>
            ))}
          </ul>
        ))}

      {tab === 'visit-history' &&
        (visits.length === 0 ? (
          <div className="space-y-2">
            <p className="text-muted">관람 기록이 없습니다.</p>
            <Link href="/exhibitions" className="link-action">
              전시를 둘러보며 관람 기록을 남겨보세요
              <ArrowRight className="inline size-4" />
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {visits.map((visit) => (
              <li key={visit.visitId}>
                <VisitRecordCard visit={visit} />
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
