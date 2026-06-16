import { getExhibitionAreas, getExhibitions } from "@/lib/api";
import { ExhibitionCard } from '@/components/ExhibitionCard';
import { RegionFilter } from "@/components/RegionFilter";
import { ExhibitionListStatus } from "@/lib/exhibition-list-params";
import { StatusFilter } from "@/components/StatusFilter";




const STATUSES: ExhibitionListStatus[] = ['ongoing', 'upcoming', 'ended'];

type Props={
    searchParams:Promise<{area?:string;status?:string}>;
}

function statusLabel(status: ExhibitionListStatus) {
    if (status === 'ongoing') return '진행중';
    if (status === 'upcoming') return '예정';
    return '종료';
  }


export default async function ExhibitionsPage({searchParams}:Props) {
    const {area,status:statusParam}=await searchParams;
   const status=STATUSES.includes(statusParam as ExhibitionListStatus)?(statusParam as ExhibitionListStatus):undefined;
   const [exhibitions,areas]=await Promise.all([getExhibitions(area,status),getExhibitionAreas(status)]);
   
   const emptyMessage=(()=>{
    if (area && status) return `${area} · ${statusLabel(status)} 전시가 없습니다.`;
    if (area) return `${area}에 해당하는 전시가 없습니다.`;
    if (status) return `${statusLabel(status)} 전시가 없습니다.`;
    return '등록된 전시가 없습니다.';
   })()



   return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="page-title">전시 목록</h1>
        <StatusFilter selectedStatus={status} selectedArea={area} />
        <RegionFilter
          areas={areas}
          selectedArea={area}
          selectedStatus={status}
        />
      </div>
      <p className="text-sm text-muted">
  {exhibitions.length}건
  {area || status
    ? ` (${[area, status && statusLabel(status)].filter(Boolean).join(' · ')})`
    : ''}
</p>
      {exhibitions.length === 0 ? (
        <p className="text-muted">{emptyMessage}</p>
      ) : (
        <ul className="exhibition-grid">
          {exhibitions.map((exhibition) => (
            <li key={exhibition.id}>
              <ExhibitionCard exhibition={exhibition} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  }
