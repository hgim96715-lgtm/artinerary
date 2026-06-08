import { getExhibitions } from "@/lib/api";
import { ExhibitionCard } from '@/components/ExhibitionCard';

export default async function ExhibitionsPage() {
    const exhibitions=await getExhibitions();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">전시 목록</h1>
            {exhibitions.length==0 ?(
                <p className="text-gray-500">등록된 전시가 없습니다.</p>
            ):(
                <ul className="space-y-4">
                    {exhibitions.map((exhibition)=>(
                        <li key={exhibition.id}>
                            <ExhibitionCard exhibition={exhibition} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  }
