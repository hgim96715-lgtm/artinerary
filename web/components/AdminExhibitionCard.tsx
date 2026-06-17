import type { AdminExhibitionRow } from '@/lib/admin-api';
import {
  formatDateRange,
  formatExhibitionTitle,
  getExhibitionStatus,
} from '@/lib/format';
import { TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { SourceBadge } from './SourceBadge';
import { VisibleBadge } from './VisibleBadge';

type Props = {
  row: AdminExhibitionRow;
  onDelete: (id: number) => void;
  disabled?: boolean;
};

export const AdminExhibitionCard = ({
  row,
  onDelete,
  disabled = false,
}: Props) => {
  const title = formatExhibitionTitle(row.title);
  const status = getExhibitionStatus(row.startDate, row.endDate);
  const isEnded=status.label === '종료';
  const ribbonClass =
    status.label === '진행중'
      ? 'ongoing'
      : status.label === '예정'
        ? 'upcoming'
        : 'ended';

  return (
    <article className="exhibition-book-mini flex h-full flex-col">
      <div className={`exhibition-book-mini-page !mt-0 relative flex flex-1 flex-col overflow-hidden ${isEnded ? 'exhibition-book-mini-page--ended' : ''}`}>
        <span
          className={`exhibition-book-mini-ribbon exhibition-book-mini-ribbon--${ribbonClass} !top-0 !right-0 rounded-none rounded-bl-md`}
        >
          {status.label}
        </span>

        <h2 className={`exhibition-book-mini-title pr-14 pt-0.5 ${isEnded ? 'text-gray-500 dark:text-gray-400' : ''}`}>{title}</h2>
        <p className="exhibition-book-mini-date">
          {formatDateRange(row.startDate, row.endDate)}
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs text-gray-700 dark:text-gray-300">
          {row.venueName ?? '장소 없음'}
          {row.area ? ` · ${row.area}` : ''}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <SourceBadge source={row.source} />
          <VisibleBadge isVisible={row.isVisible} />
        </div>
        <div className="mt-auto flex items-center justify-end gap-2 pt-3">
          <Link
            href={`/admin/exhibitions/${row.id}/edit`}
            className={`link-action text-sm ${disabled ? 'pointer-events-none opacity-50' : ''}`}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : undefined}
          >
            수정
          </Link>
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            disabled={disabled}
            className="btn-danger"
            aria-label={`${title} 삭제`}
          >
            <TrashIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
