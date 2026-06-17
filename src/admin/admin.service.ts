import { Injectable } from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const getTodayRangeKst = () => {
  const iso = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Seoul',
  });
  return {
    date: iso,
    start: new Date(`${iso}T00:00:00+09:00`),
    end: new Date(`${iso}T23:59:59.999+09:00`),
  };
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodayActivity() {
    const { date, start, end } = getTodayRangeKst();
    const [signups, wishlists, visits] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.USER, createdAt: { gte: start, lte: end } },
        select: { id: true, nickname: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wishlist.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          user: { role: Role.USER },
        },
        include: {
          user: { select: { id: true, nickname: true } },
          exhibition: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.visitRecord.findMany({
        where: {
          OR: [
            { createdAt: { gte: start, lte: end } },
            { updatedAt: { gte: start, lte: end } },
          ],
          user: { role: Role.USER },
        },
        include: {
          user: { select: { id: true, nickname: true } },
          exhibition: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const reviews = visits.filter((v) => v.note?.trim());
    return {
      date,
      summary: {
        signups: signups.length,
        wishlists: wishlists.length,
        reviews: reviews.length,
        visits: visits.length,
      },
      signups,
      wishlists: wishlists.map((w) => ({
        id: w.id,
        createdAt: w.createdAt,
        nickname: w.user.nickname,
        userId: w.user.id,
        exhibitionId: w.exhibition.id,
        exhibitionTitle: w.exhibition.title,
      })),
      visits: visits.map((v) => ({
        id: v.id,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        visitedAt: v.visitedAt,
        note: v.note,
        rating: v.rating,
        nickname: v.user.nickname,
        userId: v.user.id,
        exhibitionId: v.exhibition.id,
        exhibitionTitle: v.exhibition.title,
      })),
    };
  }
}
