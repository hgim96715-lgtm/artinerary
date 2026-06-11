'use client';

import { ExhibitionCard } from "@/components/ExhibitionCard";
import { me } from "@/lib/auth-api";
import { Exhibition } from "@/lib/types/exhibition";
import { getMyWishlist, WishlistItem } from "@/lib/wishlist-api";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


function toExhibitionCard(item:WishlistItem):Exhibition{
    return{
        id:item.id,
        source:'MANUAL',
        externalId:null,
        apiProvider:null,
        title:item.title,
        description:null,
        imageUrl:item.imageUrl,
        sourceUrl:null,
        startDate:item.startDate,
        endDate:item.endDate,
        area:item.area,
        address:null,
        latitude:null,
        longitude:null,
        priceText:null,
        discountText:null,
        feeType:'UNKNOWN',
        venueName:item.venueName,
    };
}

export default function MyPagePage(){
    const router=useRouter();
    const [nickname,setNickname]=useState('');
    const [items,setItems]=useState<WishlistItem[]>([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState('');

    useEffect(()=>{
        async function loadMyPage(){
            setLoading(true);
            setError('');
            try{
                const user=await me();
                if(user.role!=='USER'){
                    router.replace('/');
                    return;
                }
                setNickname(user.nickname);
                setItems(await getMyWishlist());
            }catch(err:unknown){
                if(err instanceof Error){
                    setError(err.message);
                }else{
                    setError('알 수 없는 오류가 발생했습니다.');
                }
                router.replace('/login');
            }finally{
                setLoading(false);
            }
        }
        void loadMyPage();
    },[router]);

    if(loading){return <p>불러오는 중입니다...</p>}
    if(error){return <p className="text-error">{error}</p>}
    return(
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="page-title">안녕하세요👋{nickname}님의 마이페이지</h1>
                <p className="text-muted">찜한 전시를 한눈에 확인해보세요.</p>
            </div>
            {error && <p className="text-error">{error}</p>}
            {items.length===0?(
                <div className="space-y-2">
                    <p className="text-muted">찜한 전시가 없습니다.</p>
                    <Link href="/exhibitions" className="link-action">전시를 둘러보며 찜해보세요<ArrowRight/></Link>
                </div>
            ):(
                <ul className="space-y-4">
                    {items.map((item)=>{
                        return(
                            <li key={item.id}>
                                <ExhibitionCard exhibition={toExhibitionCard(item)}/>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}