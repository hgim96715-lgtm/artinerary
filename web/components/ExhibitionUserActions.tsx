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
    const [status,setStatus]=useState<ExhibitionMeStatus>({
        isWishlisted:false,
        visit:null,
    })
    const reload=useCallback(async()=>{
        const user=await me();
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
                    if(!cancelled) setCanUse(false);
                }finally{
                    if(!cancelled)  setLoading(false);
                }
            }
            loadMeStatus();
            return ()=>{cancelled=true;}
        },[reload]);

        if(loading) return null;

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