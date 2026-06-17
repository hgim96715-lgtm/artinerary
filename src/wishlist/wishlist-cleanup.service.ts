import { Inject, Injectable, type LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { buildStaleWishlistExhibitionWhere } from './wishlist-exhibition.filter';

@Injectable()
export class WishlistCleanupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  /* 매일 00:05:00 KST에 실행 */
  @Cron('5 0 * * *', {
    timeZone: 'Asia/Seoul',
    name: 'wishlistCleanup',
  })
  async purgeStaleWishlists() {
    const result = await this.prisma.wishlist.deleteMany({
      where: { exhibition: buildStaleWishlistExhibitionWhere() },
    });
    if (result.count > 0) {
      this.logger.log(`${result.count}개의 찜목록 항목 삭제 완료`);
    } else {
      this.logger.log('찜목록 항목 삭제 없음');
    }
  }
}
