import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

const exhibitionSelect = {
  id: true,
  title: true,
  area: true,
  venueName: true,
  imageUrl: true,
  startDate: true,
  endDate: true,
} as const;

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: number) {
    const rows = await this.prisma.wishlist.findMany({
      where: { userId, exhibition: { isVisible: true } },
      orderBy: { createdAt: 'desc' },
      include: {
        exhibition: { select: exhibitionSelect },
      },
    });
    return rows.map((row) => ({
      wishlistedAt: row.createdAt,
      ...row.exhibition,
    }));
  }

  async addWishlist(userId: number, exhibitionId: number) {
    const exhibition = await this.prisma.exhibition.findFirst({
      where: { id: exhibitionId, isVisible: true },
      select: { id: true },
    });
    if (!exhibition) {
      throw new NotFoundException('전시를 찾을 수없습니다.');
    }
    try {
      await this.prisma.wishlist.create({
        data: { userId, exhibitionId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('이미 찜한 전시입니다.');
      }
      throw error;
    }
    return {
      message: '찜이 추가되었습니다.',
      exhibitionId,
    };
  }
  async removeWishlist(userId: number, exhibitionId: number) {
    const result = await this.prisma.wishlist.deleteMany({
      where: { userId, exhibitionId },
    });
    if (result.count === 0) {
      throw new NotFoundException('찜목록에 없는 전시입니다.');
    }
    return {
      message: '찜이 삭제되었습니다.',
      exhibitionId,
    };
  }
}
