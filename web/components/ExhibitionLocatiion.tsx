import { formatLocationDetail, getMapsSearchUrl } from "@/lib/format";
import { Exhibition } from "@/lib/types/exhibition"
import { MapPin } from "lucide-react";

type Props={
    exhibition:Pick<Exhibition,'venueName'|'area'|'address'|'latitude'|'longitude'>
}

export const ExhibitionLocation=({exhibition}:Props)=>{
    const location=formatLocationDetail(exhibition);
    const mapsUrl=getMapsSearchUrl(exhibition);

    if(!location) return null;

    return(
        <section className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <MapPin className="size-3.5" aria-hidden/>
                <span>장소</span>
            </div>
            {location.venueName&&(
                <p className="font-medium text-gray-900">{location.venueName}</p>
            )}
            {location.region &&(
                <p className="text-gray-500">{location.region}</p>
            )}
            {location.address &&(
                <p className="text-gray-500">{location.address}</p>
            )}

            {mapsUrl&&(
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-blue-600 hover:underline"
                  title="구글 지도에서 위치를 검색해요"
                >
                  지도에서보기 
                </a>
           
            )}

        </section>
    )
    
}