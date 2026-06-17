'use client';

import { AdminActivityCard } from "@/components/AdminActivityCard";
import { adminUsers, AdminUsersResponse } from "@/lib/admin-api";
import { useEffect, useState } from "react";


const formatDate=(iso:string)=>{
    return new Date(iso).toLocaleDateString('ko-KR',{
        timeZone:'Asia/Seoul',
        year:'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export default function AdminUsersPage(){
    const [data,setData]=useState<AdminUsersResponse|null>(null);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState('');

    useEffect(()=>{
        async function loadAdminPage(){
            setLoading(true);
            setError('');
            try{
                setData(await adminUsers());

            }catch(err:unknown){
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생하여 목록을 불러오지 못했습니다.');
            }finally{
                setLoading(false);
            }
        }
        loadAdminPage();
    },[]);

    if(loading) return <p className="text-muted">데이터를 불럿오는 중입니다....</p>;
    if(error) return <p className="text-error">{error}</p>;
    if(!data) return null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg fong-semibold">회원</h2>
                <p className="text-muted text-sm">회원 {data.total}명</p>
            </div>

            {data.users.length===0?(
                <p className="text-muted">등록된 회원이 없습니다.</p>
            ):(
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.users.map((user)=>(
                        <li key={user.id}>
                            <AdminActivityCard nickname={user.nickname} userId={user.id} time={`가입 ${formatDate(user.createdAt)}`}>
                                <p className="text-muted text-xs">{user.email}</p>
                                <p className="text-muted text-xs">찜 {user.wishlistCount} · 관람 {user.visitCount}</p>
                            </AdminActivityCard>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}