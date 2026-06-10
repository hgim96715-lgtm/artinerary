import { getExhibitionAreas, getExhibitions } from "@/lib/api";
import { ExhibitionCard } from '@/components/ExhibitionCard';
import { RegionFilter } from "@/components/RegionFilter";

type Props={
    searchParams:Promise<{area?:string}>;
}

export default async function ExhibitionsPage({searchParams}:Props) {
    const {area}=await searchParams;
    const [exhibitions,areas]=await Promise.all([getExhibitions(area),getExhibitionAreas()]);
    return (
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="page-title">전시 목록</h1>
            <RegionFilter areas={areas} selectedArea={area} />
          </div>
          {exhibitions.length === 0 ? (
            <p className="text-muted">
              {area
                ? `${area}에 해당하는 전시가 없습니다.`
                : '등록된 전시가 없습니다.'}
            </p>
          ) : (
            <ul className="space-y-4">
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
