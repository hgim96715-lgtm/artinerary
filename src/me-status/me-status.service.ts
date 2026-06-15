import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeStatusService {
  constructor(private readonly prisma: PrismaService) {}
  async getForExhibition(userId: number, exhibitionId: number) {
    const exhibition = await this.prisma.exhibition.findFirst({
      where: { id: exhibitionId, isVisible: true },
      select: { id: true },
    });
    if (!exhibition) {
      throw new NotFoundException('전시를 찾을 수 없습니다.');
    }
    const [wishlist, visit] = await Promise.all([
      this.prisma.wishlist.findUnique({
        where: { userId_exhibitionId: { userId, exhibitionId } },
        select: { id: true },
      }),
      this.prisma.visitRecord.findUnique({
        where: { userId_exhibitionId: { userId, exhibitionId } },
        select: {
          id: true,
          visitedAt: true,
          note: true,
          rating: true,
          isPublic: true,
        },
      }),
    ]);

    return {
      isWishlisted: wishlist !== null,
      visit: visit
        ? {
            visitId: visit.id,
            visitedAt: visit.visitedAt,
            note: visit.note,
            rating: visit.rating,
            isPublic: visit.isPublic,
          }
        : null,
    };
  }
}
