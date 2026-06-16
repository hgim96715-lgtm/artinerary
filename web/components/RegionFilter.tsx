import { FilterChip } from '@/components/FilterChip';
import {
  buildExhibitionParams,
  type ExhibitionListStatus,
} from '@/lib/exhibition-list-params';

type Props = {
  areas: { area: string; count: number }[];
  selectedArea?: string;
  selectedStatus?: ExhibitionListStatus;
};

export const RegionFilter = ({
  areas,
  selectedArea,
  selectedStatus,
}: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip
        as="link"
        href={buildExhibitionParams({ status: selectedStatus })}
        active={!selectedArea}
      >
        전국
      </FilterChip>
      {areas.map(({ area, count }) => (
        <FilterChip
          key={area}
          as="link"
          href={buildExhibitionParams({ area, status: selectedStatus })}
          active={selectedArea === area}
        >
          {area} <span className="text-xs opacity-80">({count})</span>
        </FilterChip>
      ))}
    </div>
  );
};