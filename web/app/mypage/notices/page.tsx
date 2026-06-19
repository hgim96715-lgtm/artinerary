'use client';

import { formatDate } from "@/lib/format";
import { getNotice, getNotices, NoticeListItem } from "@/lib/notice-api";
import { Bell, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const noticeDate=(item:NoticeListItem)=>{
    return formatDate(item.publishedAt?? item.createdAt)
}

export default function MyPageNoticesPage() {
  const [items,setItems]=useState<NoticeListItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    async function noticeLoad(){
        setLoading(true);
        setError('');
        try{
            setItems(await getNotices());

        }catch(err:unknown){
            setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.');
        }finally{
            setLoading(false);
        }
    }
    noticeLoad();
},[]);

  if(loading) return <p className="text-muted">불러오는 중…</p>;
  if(error) return <p className="text-error">{error}</p>;

  return(
    <div className="space-y-4">
        <h2 className="text-lg font-bold text-amber-950 dark:text-amber-50">< Megaphone className="size-4 inline-block ml-1" aria-hidden /> 공지사항</h2>
        {items.length===0 ?(
            <p className="text-muted">공지사항이 없습니다.</p>
        ):(
            <ul className="space-y-2">
                {items.map((item)=>(
                    <li key={item.id}>
                        <Link href={`/mypage/notices/${item.id}`}  className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-white px-4 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-700 dark:hover:bg-sky-950/30">
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {item.isPinned?(
                                    <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">고정</span>
                                ):null}
                                <span className="font-medium text-amber-950 dark:text-amber-50">
                                {item.title}
                                </span>
                            </div>
                            <time dateTime={item.publishedAt?? item.createdAt}>{noticeDate(item)}</time>
                        </div>
                        </Link>
                    </li>
                ))}
            </ul>
        )}
    </div>
  )
}
