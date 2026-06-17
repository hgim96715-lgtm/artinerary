import { FilterChip } from '@/components/FilterChip';
import {
  buildExhibitionParams,
  type ExhibitionListStatus,
} from '@/lib/exhibition-list-params';

type Props = {
  areas: { area: string; count: number }[];
  selectedArea?: string;
  selectedStatus?: ExhibitionListStatus;
  selectedQ?: string;
};

export const RegionFilter = ({
  areas,
  selectedArea,
  selectedStatus,
  selectedQ,
}: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip
        as="link"
        href={buildExhibitionParams({ status: selectedStatus, q: selectedQ })}
        active={!selectedArea}
      >
        전국
      </FilterChip>
      {areas.map(({ area, count }) => (
        <FilterChip
          key={area}
          as="link"
          href={buildExhibitionParams({
            area,
            status: selectedStatus,
            q: selectedQ,
          })}
          active={selectedArea === area}
        >
          {area} <span className="text-xs opacity-80">({count})</span>
        </FilterChip>
      ))}
    </div>
  );
};