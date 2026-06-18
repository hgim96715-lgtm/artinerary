import { getReturnPathLabel, resolveReturnPath } from "@/lib/return-path";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";



type Props={
    from?:string|null;
}

export const ExhibitionBackLink=({from}:Props)=>{
    const returnPath=resolveReturnPath(from);
    const href=returnPath??'/exhibitions';
    const label=returnPath? getReturnPathLabel(returnPath):'전시 목록 보기';

return(
    <Link href={href} className="link-back">
        <ArrowLeft/>
        <span>{label}</span>
    </Link>
);
}