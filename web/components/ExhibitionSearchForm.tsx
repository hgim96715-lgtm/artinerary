import { ExhibitionListStatus } from "@/lib/exhibition-list-params";
import { SearchIcon } from "lucide-react";

type Props={
    q?:string;
    area?:string;
    status?:ExhibitionListStatus;
}

export const ExhibitionSearchForm=({q,area,status}:Props)=>{
    return(
        <form method="get" action="/exhibitions" className="flex flex-col gap-2 sm:flex-row sm:items-end">
            {area? <input type="hidden" name="area" value={area}/>:null}
            {status? <input type="hidden" name="status" value={status}/>:null}
            <div className="flex-1">
                <label htmlFor="exhibition-search" className="label-field">검색</label>
                <input type="search" id="exhibition-search" name="q" defaultValue={q ?? ''} placeholder="제목 · 장소 · 지역" />
            </div>
            <button type="submit" className="btn-secondary gap-2">
                <SearchIcon className="size-4" aria-hidden="true" />
                검색
            </button>
        </form>
    )
}