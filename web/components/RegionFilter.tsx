import Link from "next/link";

type Props={
    areas:{area:string,count:number}[];
    selectedArea?:string;
}

export const RegionFilter=({areas,selectedArea}:Props)=>{
    const base='/exhibitions';

    const chipClass=(active:boolean)=>{
        return `rounded-full px-3 py-1 text-sm border transition-colors${active?'bg-blue-500 text-white border-blue-500':'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`;
    }
    return(
        <div className="flex flex-wrap gap-2">
            <Link href={base} className={chipClass(!selectedArea)}>
            전국
            </Link>
            {areas.map(({area,count})=>(
                <Link key={area} href={`${base}?area=${encodeURIComponent(area)}`} className={chipClass(selectedArea===area)}>
                    {area} <span className="text-xs opacity-80">({count})</span>
                </Link>
            ))}
        </div>
    )
}