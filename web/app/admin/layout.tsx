'use client';

import { FilterChip } from "@/components/FilterChip";
import { adminLogout, adminMe } from "@/lib/admin-api";
import { LogOutIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props={
    children:React.ReactNode;
}

const AdminLayout=({children}:Props)=>{
    const router=useRouter();
    const pathname=usePathname();
    const [email,setEmail]=useState('');
    const [ready,setReady]=useState(false);
    const [nickname,setNickname]=useState('');

    const isLoginRoute=pathname==='/admin/login';
    const showAdminTabs=
        pathname.startsWith('/admin/exhibitions')||
        pathname.startsWith('/admin/notices')||
        pathname==='/admin/activity'||
        pathname==='/admin/users';

    useEffect(()=>{
        if(isLoginRoute){
            setReady(true);
            return;
        }
        const load=async()=>{
            try{
                const me=await adminMe();
                setEmail(me.email);
                setNickname(me.nickname);
                setReady(true);
            }catch{
                router.replace('/login')
            }
        };
        void load();
    },[isLoginRoute,router]);

    const onLogout=async()=>{
        try{
            await adminLogout();
        }finally{
            router.replace('/login');
            router.refresh();
        }
    };
    if(isLoginRoute){
        return children;
    }
    if(!ready){
        return <p className="text-muted">불러오는중...</p>
    }
    return(
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="page-title">
                  {nickname ? `${nickname}님의 관리창` : '관리창'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    {email && <span>{email}</span>}
                    <button type="button" onClick={onLogout} className="link-action" aria-label="로그아웃">
                        <LogOutIcon className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
            {showAdminTabs && (
                <div className="flex flex-wrap gap-2">
                    <FilterChip as="link" href="/admin/exhibitions" active={pathname.startsWith('/admin/exhibitions')}>전시 목록</FilterChip>
                    <FilterChip as="link" href="/admin/notices" active={pathname.startsWith('/admin/notices')}>공지 목록</FilterChip>
                    <FilterChip as="link" href="/admin/activity" active={pathname==='/admin/activity'}>사용자의 오늘 활동</FilterChip>
                    <FilterChip as="link" href="/admin/users" active={pathname==='/admin/users'}>회원 목록</FilterChip>
                </div>
            )}
            {children}
        </div>

    )
}

export default AdminLayout;