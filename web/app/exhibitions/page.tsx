import { getExhibitionAreas, getExhibitions } from '@/lib/api';
import { ExhibitionCard } from '@/components/ExhibitionCard';
import { ExhibitionSearchForm } from '@/components/ExhibitionSearchForm';
import { RegionFilter } from '@/components/RegionFilter';
import { StatusFilter } from '@/components/StatusFilter';
import {
  buildExhibitionParams,
  ExhibitionListStatus,
} from '@/lib/exhibition-list-params';
import Link from 'next/link';

const STATUSES: ExhibitionListStatus[] = ['ongoing', 'upcoming', 'ended'];

type Props = {
  searchParams: Promise<{ area?: string; status?: string; q?: string }>;
};

const statusLabel = (status: ExhibitionListStatus) => {
  if (status === 'ongoing') return '진행중';
  if (status === 'upcoming') return '예정';
  return '종료';
};

export default async function ExhibitionsPage({ searchParams }: Props) {
  const { area, status: statusParam, q } = await searchParams;
  const status = STATUSES.includes(statusParam as ExhibitionListStatus)
    ? (statusParam as ExhibitionListStatus)
    : undefined;
  const trimmedQ = q?.trim() || undefined;

  const [exhibitions, areas] = await Promise.all([
    getExhibitions(area, status, trimmedQ),
    getExhibitionAreas(status),
  ]);

  const summaryParts = [
    area,
    status && statusLabel(status),
    trimmedQ && `"${trimmedQ}"`,
  ].filter(Boolean);

  const emptyMessage = (() => {
    if (trimmedQ) {
      const scope = [area, status && statusLabel(status)]
        .filter(Boolean)
        .join(' · ');
      return scope
        ? `${scope}에서 "${trimmedQ}" 검색 결과가 없습니다.`
        : `"${trimmedQ}" 검색 결과가 없습니다.`;
    }
    if (area && status) {
      return `${area} · ${statusLabel(status)} 전시가 없습니다.`;
    }
    if (area) return `${area}에 해당하는 전시가 없습니다.`;
    if (status) return `${statusLabel(status)} 전시가 없습니다.`;
    return '등록된 전시가 없습니다.';
  })();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="page-title">전시 목록</h1>
        <ExhibitionSearchForm q={trimmedQ} area={area} status={status} />
        <StatusFilter
          selectedStatus={status}
          selectedArea={area}
          selectedQ={trimmedQ}
        />
        <RegionFilter
          areas={areas}
          selectedArea={area}
          selectedStatus={status}
          selectedQ={trimmedQ}
        />
      </div>
      <p className="text-sm text-muted">
        {exhibitions.length}건
        {summaryParts.length > 0 ? ` (${summaryParts.join(' · ')})` : ''}
      </p>
      {exhibitions.length === 0 ? (
        <p className="text-muted">
          {emptyMessage}
          {trimmedQ ? (
            <>
              {' '}
              <Link
                href={buildExhibitionParams({ area, status })}
                className="link-action"
              >
                검색어 지우기
              </Link>
            </>
          ) : null}
        </p>
      ) : (
        <ul className="exhibition-grid">
          {exhibitions.map((exhibition) => (
            <li key={exhibition.id}>
              <ExhibitionCard exhibition={exhibition} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
