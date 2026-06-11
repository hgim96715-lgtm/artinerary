import { ExhibitionLocation } from "@/components/ExhibitionLocatiion";
import { getExhibition } from "@/lib/api";
import { formatDescriptionForDisplay } from "@/lib/description";
import { formatDateRange, formatExhibitionTitle, getExhibitionStatus } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WishlistButton } from "@/components/WishlistButton";

type Props={params:Promise<{id:string}>}

export default async function ExhibitionsDetailPage({params}:Props) {
    const {id}=await params;
    const exhibition=await getExhibition(id);
    if (!exhibition) {
      notFound();
    }
    const status=getExhibitionStatus(exhibition.startDate,exhibition.endDate);
    // const place=getPlace(exhibition);
  return (
    
   <article className="space-y-6">
    <Link href="/exhibitions" className="link-back">
        <ArrowLeft/>
        <span>전시 목록 보기</span>
    </Link>
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${status.color} text-${status.color}-500`}>{status.label}</span>
    <h1 className="text-2xl font-bold">{formatExhibitionTitle(exhibition.title)}</h1>
    <WishlistButton exhibitionId={exhibition.id} />
    <p className="text-gray-600">{formatDateRange(exhibition.startDate,exhibition.endDate)}</p>
    <ExhibitionLocation exhibition={exhibition} />
    {exhibition.priceText && (
        <p className="text-sm font-medium">{exhibition.priceText}</p>
    )}
    {exhibition.imageUrl && (
        <img src={exhibition.imageUrl} alt={exhibition.title} className="w-full max-h-96 object-cover rounded-lg mb-4" />
    )}
    {/* 디버깅용 지우지 말기! */}
    {/* <pre className="text-xs overflow-auto rounded-lg color-white p-4">
        {JSON.stringify(exhibition, null, 2)}
    </pre> */}
        <section className="space-y-3 text-sm">
      {exhibition.description ? (
        <p className="leading-relaxed whitespace-pre-wrap text-gray-800">
          {formatDescriptionForDisplay(exhibition.description)}
        </p>
      ) : (
        <p className="text-gray-500">
          자세한 설명은 홈페이지를 참고해 주세요.
        </p>
      )}
      {exhibition.sourceUrl && (
        <a
          href={exhibition.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-blue-600 hover:underline"
        >
          홈페이지 바로가기
        </a>
      )}
    </section>
   </article>
  );
  
}
