import { FilterChip } from '@/components/FilterChip';

type Props = {
  areas: { area: string; count: number }[];
  selectedArea?: string;
};

export const RegionFilter = ({ areas, selectedArea }: Props) => {
  const base = '/exhibitions';

  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip as="link" href={base} active={!selectedArea}>
        전국
      </FilterChip>
      {areas.map(({ area, count }) => (
        <FilterChip
          key={area}
          as="link"
          href={`${base}?area=${encodeURIComponent(area)}`}
          active={selectedArea === area}
        >
          {area} <span className="text-xs opacity-80">({count})</span>
        </FilterChip>
      ))}
    </div>
  );
};
