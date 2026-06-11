'use client';

import { me } from '@/lib/auth-api';
import {
  addWishlist,
  getMyWishlist,
  removeWishlist,
} from '@/lib/wishlist-api';
import { ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  exhibitionId: number;
};

/**
 * 찜 버튼 흐름
 * 1. 마운트 시 me() → USER인지 확인
 * 2. USER가 아니면 canUse=false (비로그인·ADMIN 등)
 * 3. USER면 getMyWishlist()로 이 전시 찜 여부 반영
 * 4. 클릭 시 addWishlist / removeWishlist → wishlisted 토글
 *
 * 상태
 * - loading: 로그인·찜 목록 조회 중
 * - submitting: 찜 추가/삭제 요청 중
 * - canUse: USER로 찜 API 사용 가능
 * - wishlisted: 이 전시가 내 찜 목록에 있음
 * - error: API 오류 메시지
 */
export function WishlistButton({ exhibitionId }: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canUse, setCanUse] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    /** 언마운트 후 setState 방지 */
    const runIfMounted = (fn: () => void) => {
      if (!cancelled) fn();
    };

    async function loadWishlistState() {
      setLoading(true);
      setError('');

      try {
        const user = await me();

        if (user.role !== 'USER') {
          runIfMounted(() => setCanUse(false));
          return;
        }

        const list = await getMyWishlist();
        const isWishlisted = list.some((item) => item.id === exhibitionId);

        runIfMounted(() => {
          setCanUse(true);
          setWishlisted(isWishlisted);
        });
      } catch {
        runIfMounted(() => setCanUse(false));
      } finally {
        runIfMounted(() => setLoading(false));
      }
    }

    void loadWishlistState();

    return () => {
      cancelled = true;
    };
  }, [exhibitionId]);

  async function onToggleWishlist(){
    if(!canUse || submitting) return;
    setSubmitting(true);
    setError('');
    try{
        if(wishlisted){
            await removeWishlist(exhibitionId);
            setWishlisted(false);
        }else{
            await addWishlist(exhibitionId);
            setWishlisted(true);
        }
    }catch(err:unknown){
        if(err instanceof Error){
            setError(err instanceof Error ? err.message : '찜 처리에 실패했습니다.');
        }else{
            setError('오류가 발생했습니다.');
        }
    }finally{
        setSubmitting(false);
    }
  }
  if (loading){return null;}

  if(!canUse){
    return(
        <p className="text-sm text-muted">
            <Link href="/login" className="link-action">로그인</Link>{' '}
            하면 찜 기능을 사용할 수 있습니다
            <ArrowRight/>
        </p>
    )
  }

return(
    <div className="flex flex-col gap-1">
        <button type="button" onClick={onToggleWishlist} disabled={submitting} className="inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50" aria-pressed={wishlisted} aria-label={wishlisted?'찜 취소':'찜 하기'}>
            <Heart className={`size-5 ${wishlisted ? 'fill-red-500' : 'text-gray-500'}`}/>
            {wishlisted ? '찜 취소' : '찜 하기'}
        </button>
        {error && <p className="text-error">{error}</p>}
    </div>
)
  
 
}
