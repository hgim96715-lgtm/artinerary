import type { ExhibitionAreaStat } from '@/lib/api';
import type { ExhibitionListStatus } from '@/lib/exhibition-list-params';
import Link from 'next/link';

type Props = {
  areas: ExhibitionAreaStat[];
  status?: ExhibitionListStatus;
};

const CHART_HEIGHT = 'h-40';

export const AreaExhibitionChart = ({
  areas,
  status = 'ongoing',
}: Props) => {
  if (areas.length === 0) {
    return (
      <p className="text-sm text-muted">진행 중인 전시 지역 데이터가 없습니다.</p>
    );
  }

  const total = areas.reduce((sum, row) => sum + row.count, 0);
  const max = Math.max(...areas.map((row) => row.count), 1);

  return (
    <section className="exhibition-book-intro home-panel space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="exhibition-book-intro-title !mb-0">
          지역별 진행 중 전시
        </h2>
        <span className="text-xs text-muted">총 {total}건</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <ul
          className="flex min-w-full items-end gap-2 sm:gap-3"
          style={{ minWidth: `${areas.length * 3.25}rem` }}
          role="list"
        >
          {areas.map(({ area, count }) => {
            const height = `${Math.round((count / max) * 100)}%`;
            const href = `/exhibitions?area=${encodeURIComponent(area)}&status=${status}`;

            return (
              <li
                key={area}
                className="flex min-w-[2.75rem] flex-1 flex-col items-center"
              >
                <Link
                  href={href}
                  className="group flex w-full flex-col items-center gap-2 rounded-lg px-0.5 py-1 transition-colors hover:bg-amber-900/5"
                >
                  <span className="text-xs font-medium text-muted">
                    {count}건
                  </span>

                  <div
                    className={`flex w-full max-w-10 items-end justify-center ${CHART_HEIGHT}`}
                    aria-hidden
                  >
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-rose-400 to-amber-300 transition-all group-hover:from-rose-500 group-hover:to-amber-400"
                      style={{
                        height,
                        minHeight: count > 0 ? '0.375rem' : undefined,
                      }}
                    />
                  </div>

                  <span
                    className="max-w-[3.5rem] truncate text-center text-[10px] leading-tight font-medium sm:max-w-[4rem] sm:text-xs"
                    title={area}
                  >
                    {area}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
