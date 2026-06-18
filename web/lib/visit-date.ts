export const toVisitDateKey = (iso: string) => iso.slice(0, 10);

export const toVisitDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`);

export const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const isValidDateKey = (key: string) => /^\d{4}-\d{2}-\d{2}$/.test(key);

export const formatVisitDateLabel = (key: string) => key.replace(/-/g, '.');
