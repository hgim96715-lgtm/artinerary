'use client';

import { applyTheme, notifyThemeChange, readStoredTheme, THEME_EVENT, ThemePreference, writeStoredTheme } from "@/lib/theme";
import { Globe, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const CYCLE:ThemePreference[]=['system','light','dark'];

const LABEL:Record<ThemePreference,string>={
    system:'시스템 설정',
    light:'라이트 모드',
    dark:'다크 모드',
};

const ThemeIcon=({preference}:{preference:ThemePreference})=>{
    if(preference==='light'){
        return <Sun className="size-4 shrink-0" aria-hidden />;
    }
    if(preference==='dark'){
        return <Moon className="size-4 shrink-0" aria-hidden />;
    }
    return <Monitor className="size-4 shrink-0" aria-hidden />;
}

export const ThemeToggle=()=>{
    const [preference,setPreference]=useState<ThemePreference>('system');

    useEffect(()=>{
        setPreference(readStoredTheme());
        const onThemeChange=(e:Event)=>{
            setPreference((e as CustomEvent<ThemePreference>).detail);
        };
        window.addEventListener(THEME_EVENT,onThemeChange);
        return ()=>window.removeEventListener(THEME_EVENT,onThemeChange)
    },[]);

    useEffect(()=>{
        if(preference!=='system') return;
        const mq=window.matchMedia('(prefers-color-scheme: dark)');
        const onChange=()=>applyTheme('system');
        mq.addEventListener('change',onChange);
        return ()=>mq.removeEventListener('change',onChange);
    },[preference]);

    const onClick=()=>{
        const next=CYCLE[(CYCLE.indexOf(preference)+1)%CYCLE.length];
        writeStoredTheme(next);
        applyTheme(next);
        notifyThemeChange(next);
        setPreference(next);
    }

    return (
        <button type="button" className="nav-auth-link inline-flex items-center px-2" onClick={onClick} title={`테마: ${LABEL[preference]}`} aria-label={`테마 ${LABEL[preference]}, 클릭하여 변경`}>
            <ThemeIcon preference={preference} />
        </button>
    )
}