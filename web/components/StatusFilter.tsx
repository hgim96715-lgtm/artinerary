import { buildExhibitionParams, ExhibitionListStatus } from "@/lib/exhibition-list-params";
import { FilterChip } from "./FilterChip";

const OPTIONS: { value?: ExhibitionListStatus; label: string }[] = [
    { label: '전체' },
    { value: 'ongoing', label: '진행중' },
    { value: 'upcoming', label: '예정' },
    { value: 'ended', label: '종료' },
  ];

type Props={
    selectedStatus?: ExhibitionListStatus;
    selectedArea?: string;
}

export function StatusFilter({selectedStatus,selectedArea}:Props){
    return(
        <div className="flex flex-wrap gap-2">
            {OPTIONS.map(({value,label})=>(
                <FilterChip key={label} as="link" href={buildExhibitionParams({area:selectedArea,status:value})} active={selectedStatus===value} tone="amber">
                    {label}
                </FilterChip>
            ))}
        </div>
    )
}