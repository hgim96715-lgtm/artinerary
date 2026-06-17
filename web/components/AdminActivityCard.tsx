import type { ReactNode } from 'react';

type Props = {
  nickname: string;
  userId: number;
  time: string;
  children: ReactNode;
};


export const AdminActivityCard = ({
  nickname,
  userId,
  time,
  children,
}: Props) => {
  return (
    <article className="exhibition-book-mini-page !mt-0 flex h-full flex-col gap-2 text-sm">
      <div>
        <p className="text-base font-bold leading-snug text-amber-950 dark:text-amber-50">
          @{nickname}
          <span className="text-muted ml-5 text-[11px]"> USER ID: {userId}</span>
        </p>
      </div>
      <div className="min-w-0 flex-1 space-y-1">{children}</div>
      <p className="text-muted text-xs">{time}</p>
    </article>
  );
};
