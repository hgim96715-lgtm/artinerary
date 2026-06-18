/** 관람 목록용 전시 상태 —
 * 종료(KST)·비공개·상세 링크 가능 여부.
 * 찜 필터와 분리(관람은 삭제 안 함).
 */

import { getTodayRangeKst } from 'src/common/data-kst';

export const isExhibitionEndedKst = (endDate: Date) => {
  const { start: todayStartKst } = getTodayRangeKst();
  return endDate < todayStartKst;
};

export const buildVisitExhibitionMeta = (exhibition: {
  isVisible: boolean;
  endDate: Date;
}) => {
  const isEnded = isExhibitionEndedKst(exhibition.endDate);
  return {
    isExhibitionVisible: exhibition.isVisible,
    isEnded,
    canOpenDetail: exhibition.isVisible && !isEnded,
  };
};
