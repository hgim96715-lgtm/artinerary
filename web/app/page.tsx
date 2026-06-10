import { getExhibitions } from "@/lib/api";
import { isOngoing } from "@/lib/format";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExhibitionCard } from "@/components/ExhibitionCard";

export default async function Home() {
    const exhibitions=await getExhibitions();
    const ongoing=exhibitions.filter((exhibition)=>isOngoing(exhibition.startDate,exhibition.endDate));
    const preview=ongoing.slice(0,3);

    
  return (
    <div className="space-y-10">
        <section className="space-y-3">
            <h1 className="text-3xl font-bold">지금 열리는 전시 🎨</h1>
            <p className="text-gray-600">지금 열리는 전시를 확인해보세요.</p>
            <Link href="/exhibitions" className="btn-accent gap-2">
            전시 목록 보기
            <ArrowRight/>
            </Link>
        </section>

        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">진행 중인전시</h2>
                {ongoing.length>3 && (
                    <Link href="/exhibitions" className="link-back">전체보기 <ArrowRight/></Link>
                )}
            </div>

            {exhibitions.length===0?(
                <p className="text-muted">등록된 전시가 없습니다.</p>
            ):preview.length===0?(
                <p className="text-muted">지금 진행 중인 전시가 없습니다.</p>
            ):(
                <ul className="space-y-4">
                    {preview.map((exhibition)=>(
                        <li key={exhibition.id}><ExhibitionCard exhibition={exhibition} /></li>
                    ))}
                </ul>
            )}

        </section>
    </div>
    
  );
}
