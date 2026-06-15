import Link from 'next/link';
import type { ReactNode } from 'react';

export type FilterChipTone = 'blue' | 'amber';

export function filterChipClass(active: boolean, tone: FilterChipTone = 'blue') {
  const base = 'filter-chip';
  if (tone === 'amber') {
    return `${base} ${active ? 'filter-chip--active-amber' : 'filter-chip--inactive-amber'}`;
  }
  return `${base} ${active ? 'filter-chip--active-blue' : 'filter-chip--inactive-blue'}`;
}

type FilterChipBase = {
  active: boolean;
  children: ReactNode;
  tone?: FilterChipTone;
  className?: string;
};

type FilterChipButton = FilterChipBase & {
  as: 'button';
  onClick: () => void;
};

type FilterChipLink = FilterChipBase & {
  as: 'link';
  href: string;
};

type FilterChipProps = FilterChipButton | FilterChipLink;

export function FilterChip(props: FilterChipProps) {
  const { active, children, tone = 'blue', className = '', } = props;
  const chipClass = `${filterChipClass(active, tone)} ${className}`.trim();

  if (props.as === 'link') {
    return (
      <Link href={props.href} className={chipClass} >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={props.onClick} className={chipClass} >
      {children}
    </button>
  );
}
