import type { ExhibitionSource } from '@/lib/types/exhibition';

export function SourceBadge({ source }: { source: ExhibitionSource }) {
  const isManual = source === 'MANUAL';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isManual
          ? 'border border-amber-200 bg-amber-100 text-amber-800'
          : 'border border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {isManual ? 'MANUAL' : 'API'}
    </span>
  );
}
