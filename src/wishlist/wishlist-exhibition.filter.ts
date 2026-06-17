import { Prisma } from 'generated/prisma/client';
import { getTodayRangeKst } from 'src/common/data-kst';

/* 비공개 또는 종료(KST 당일 00:00 이전 endDate) 된 전시 */
export const buildStaleWishlistExhibitionWhere =
  (): Prisma.ExhibitionWhereInput => {
    const { start: todayStartKst } = getTodayRangeKst();
    return {
      OR: [{ isVisible: false }, { endDate: { lt: todayStartKst } }],
    };
  };

/*찜 목록에 보여줄 전시 */
export const buildActiveWishlistExhibitionWhere =
  (): Prisma.ExhibitionWhereInput => {
    const { start: todayStartKst } = getTodayRangeKst();
    return {
      isVisible: true,
      endDate: { gte: todayStartKst },
    };
  };
