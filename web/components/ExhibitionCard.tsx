import {
  formatDateRange,
  formatExhibitionTitle,
  getExhibitionStatus,
} from '@/lib/format';
import { Exhibition } from '@/lib/types/exhibition';
import Link from 'next/link';

type Props = {
  exhibition: Exhibition;
};

export function ExhibitionCard({ exhibition }: Props) {
  const status = getExhibitionStatus(
    exhibition.startDate,
    exhibition.endDate,
  );
  const title = formatExhibitionTitle(exhibition.title);
  const ribbonClass =
    status.label === '진행중'
      ? 'ongoing'
      : status.label === '예정'
        ? 'upcoming'
        : 'ended';

  return (
    <Link
      href={`/exhibitions/${exhibition.id}`}
      className="exhibition-book-mini group"
    >
      <div className="exhibition-book-mini-cover">
        {exhibition.imageUrl ? (
          <img src={exhibition.imageUrl} alt="" />
        ) : (
          <div className="exhibition-book-mini-placeholder">
            <span aria-hidden>✦</span>
            <p className="line-clamp-3">{title}</p>
          </div>
        )}
        <span className={`exhibition-book-mini-ribbon exhibition-book-mini-ribbon--${ribbonClass}`}>
          {status.label}
        </span>
      </div>
      <div className="exhibition-book-mini-page">
        <h2 className="exhibition-book-mini-title">{title}</h2>
        <p className="exhibition-book-mini-date">
          {formatDateRange(exhibition.startDate, exhibition.endDate)}
        </p>
      </div>
    </Link>
  );
}
