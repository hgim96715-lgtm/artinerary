'use client';

import { WishlistRecordCard } from '@/components/WishlistRecordCard';
import { getMyWishlist, type WishlistItem } from '@/lib/wishlist-api';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MyPageWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        setItems(await getMyWishlist());
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
      <h2 className="text-lg font-semibold">찜한 전시</h2>

      {items.length === 0 ? (
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
      )}
    </div>
  );
}
