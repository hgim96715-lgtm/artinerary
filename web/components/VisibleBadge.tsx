export function VisibleBadge({ isVisible }: { isVisible: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isVisible
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border border-gray-200 bg-gray-100 text-gray-600'
      }`}
    >
      {isVisible ? '공개' : '비공개'}
    </span>
  );
}
