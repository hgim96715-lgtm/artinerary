export const hasHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);

/** 상세 UI용 — 태그 제거, br은 줄바꿈 */
export const stripHtml = (text: string) =>
  text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

export const formatDescriptionForDisplay = (description: string) =>
  hasHtml(description) ? stripHtml(description) : description;
