'use client';

import { me } from "@/lib/auth-api";
import { ExhibitionMeStatus, getExhibitionMeStatus } from "@/lib/me-status-api";
import { useCallback, useEffect, useState } from "react";
import { WishlistButton } from "./WishlistButton";
import VisitButton from "./VisitButton";

type Props={exhibitionId:number};

export function ExhibitionUserActions({exhibitionId}:Props){
    const [loading,setLoading]=useState(true);
    const [canUse,setCanUse]=useState(false);
    const [isAdmin,setIsAdmin]=useState(false)
    const [status,setStatus]=useState<ExhibitionMeStatus>({
        isWishlisted:false,
        visit:null,
    })
    const reload=useCallback(async()=>{
        const user=await me();
        if(user.role ==='ADMIN'){
            setIsAdmin(true);
            setCanUse(false);
            return;
        }
        if(user.role !=='USER'){
            setCanUse(false);
            return;
        }
        const data=await getExhibitionMeStatus(exhibitionId);
        setCanUse(true);
        setStatus(data);
        },[exhibitionId]);

        useEffect(()=>{
            let cancelled=false;
            async function loadMeStatus(){
                setLoading(true);
                try{
                    await reload();
                }catch{
                    if(!cancelled){
                        setCanUse(false);
                        setIsAdmin(false);
                    }
                }finally{
                    if(!cancelled)  setLoading(false);
                }
            }
            loadMeStatus();
            return ()=>{cancelled=true;}
        },[reload]);

        if(loading ) return null;

        if(isAdmin){
            return(
                <div className="exhibition-book-actions space-y-2 border-l-2 border-amber-200/80 pl-3 text-sm text-muted">
                    <p>
                        <span className="font-medium text-foreground text-muted">찜</span> - 일반 회원만 사용할 수 있습니다.
                    </p>
                    <p>
                        <span className="font-medium text-foreground text-muted">관람기록</span> - 일반 회원만 사용할 수 있습니다.
                    </p>
                    <p className="text-xs text-rose-500/80">
                        관리자 계정으로는 이용할 수 없어요.
                        일반 회원으로 로그인해주세요.
                    </p>
                </div>
            )
        }

        return(
            <div className="exhibition-book-actions">
            <WishlistButton
            exhibitionId={exhibitionId}
            canUse={canUse}
            wishlisted={status.isWishlisted}
            onWishlistChange={(next)=>{
                setStatus((s)=>({...s,isWishlisted:next}))
            }}/>
            <VisitButton
            exhibitionId={exhibitionId}
            canUse={canUse}
            visit={status.visit}
            onVisitChange={(visit)=>{
                setStatus((s)=>({...s,visit,isWishlisted:visit?false:s.isWishlisted}))
            }}
            />
            </div>
        )
}