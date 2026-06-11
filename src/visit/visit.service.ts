import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const exhibitionSelect = {
  id: true,
  title: true,
  area: true,
  venueName: true,
  imageUrl: true,
  startDate: true,
  endDate: true,
} as const;

export type UpsertVisitInput = {
  visitedAt?: Date;
  note?: string | null;
  rating?: number | null;
  isPublic?: boolean;
};

export type UpdateVisitInput = {
  visitedAt?: Date;
  note?: string | null;
  rating?: number | null;
  isPublic?: boolean;
};

@Injectable()
export class VisitService {
  constructor(private readonly prisma: PrismaService) {}
  private assertRating(rating: number) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('별점은 1~5 사이여야 합니다.');
    }
  }

  async findMine(userId: number) {
    const rows = await this.prisma.visitRecord.findMany({
      where: { userId, exhibition: { isVisible: true } },
      orderBy: { visitedAt: 'desc' },
      include: {
        exhibition: { select: exhibitionSelect },
      },
    });
    return rows.map((row) => ({
      visitId: row.id,
      visitedAt: row.visitedAt,
      note: row.note,
      rating: row.rating,
      isPublic: row.isPublic,
      ...row.exhibition,
    }));
  }

  async upsertForExhibition(
    userId: number,
    exhibitionId: number,
    input: UpsertVisitInput,
  ) {
    const exhibition = await this.prisma.exhibition.findFirst({
      where: { id: exhibitionId, isVisible: true },
      select: { id: true },
    });
    if (!exhibition) {
      throw new NotFoundException('전시를 찾을 수 없습니다.');
    }
    if (input.rating != null) {
      this.assertRating(input.rating);
    }
    const visitedAt = input.visitedAt ?? new Date();
    const visit = await this.prisma.$transaction(async (tx) => {
      const record = await tx.visitRecord.upsert({
        where: { userId_exhibitionId: { userId, exhibitionId } },
        create: {
          userId,
          exhibitionId,
          visitedAt,
          note: input.note ?? null,
          rating: input.rating ?? null,
          isPublic: input.isPublic ?? false,
        },
        update: {
          visitedAt,
          ...(input.note !== undefined ? { note: input.note } : {}),
          ...(input.rating !== undefined ? { rating: input.rating } : {}),
          ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
        },
      });
      await tx.wishlist.deleteMany({
        where: { userId, exhibitionId },
      });
      return record;
    });
    return {
      message: '방문 관람 기록이 저장되었습니다.',
      visitId: visit.id,
      exhibitionId,
    };
  }

  async updateMine(userId: number, visitId: number, input: UpdateVisitInput) {
    const existing = await this.prisma.visitRecord.findFirst({
      where: { id: visitId, userId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('방문 관람 기록을 찾을 수 없습니다.');
    }
    if (input.rating != null) {
      this.assertRating(input.rating);
    }
    const visit = await this.prisma.visitRecord.update({
      where: { id: visitId },
      data: {
        ...(input.visitedAt !== undefined
          ? { visitedAt: input.visitedAt }
          : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.rating !== undefined ? { rating: input.rating } : {}),
        ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
      },
    });
    return {
      message: '방문 관람 기록이 수정되었습니다.',
      visitId: visit.id,
    };
  }
  async removeMine(userId: number, visitId: number) {
    const result = await this.prisma.visitRecord.deleteMany({
      where: { id: visitId, userId },
    });
    if (result.count === 0) {
      throw new NotFoundException('방문 관람 기록을 찾을 수 없습니다.');
    }
    return {
      message: '방문 관람 기록이 삭제되었습니다.',
      visitId,
    };
  }
}
