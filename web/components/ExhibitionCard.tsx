import { getExhibition } from "@/lib/api"
import { formatDateRange, getExhibitionStatus, getPlace } from "@/lib/format"
import { Exhibition } from "@/lib/types/exhibition"
import Link from "next/link"

type Props={
    exhibition:Exhibition
}

export const ExhibitionCard=({exhibition}:Props)=>{
    const status=getExhibitionStatus(exhibition.startDate,exhibition.endDate);
    const place=getPlace(exhibition);
    return(
        <Link href={`/exhibitions/${exhibition.id}`} className="block border border-gray-200 rounded-xl p-4 hover:bg-gray-100 hover:text-blue-600 transition-colors">
            {exhibition.imageUrl&&(
                <img src={exhibition.imageUrl} alt={exhibition.title} className="w-full h-40 object-cover rounded-lg mb-3" />)}
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${status.color}`}>{status.label}</span>
                <h2 className="text-lg font-semibold">{exhibition.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                    {formatDateRange(exhibition.startDate,exhibition.endDate)}
                </p>
                {place && <p className="text-sm text-gray-500 mt-1">{place}</p>}
        </Link>
    )
}