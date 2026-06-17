import type { AdminExhibitionActivity } from '@/lib/admin-api';
import { formatExhibitionTitle } from '@/lib/format';
import Link from 'next/link';
import { SourceBadge } from './SourceBadge';
import { VisibleBadge } from './VisibleBadge';

type ExhibitionEdit = AdminExhibitionActivity['exhibitionEdits'][number];

type Props = {
  item: ExhibitionEdit;
  time: string;
};

export const AdminExhibitionEditCard = ({ item, time }: Props) => {
  const title = formatExhibitionTitle(item.title);

  return (
    <article className="exhibition-book-mini-page !mt-0 flex h-full flex-col gap-2 text-sm">
      <h2 className="exhibition-book-mini-title line-clamp-2 leading-snug">
        <Link
          href={`/admin/exhibitions/${item.id}/edit`}
          className="link-action"
        >
          {title}
        </Link>
      </h2>
      <div className="flex flex-wrap items-center gap-1.5">
        <SourceBadge source={item.source} />
        <VisibleBadge isVisible={item.isVisible} />
      </div>
      <p className="text-muted mt-auto text-xs">수정 {time}</p>
    </article>
  );
};
