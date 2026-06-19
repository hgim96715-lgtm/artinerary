import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished() {
    return this.prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        isPinned: true,
        publishedAt: true,
        createdAt: true,
      },
    });
  }

  async findPublishedById(id: number) {
    const row = await this.prisma.notice.findFirst({
      where: { id, isPublished: true },
      select: {
        id: true,
        title: true,
        body: true,
        publishedAt: true,
        createdAt: true,
      },
    });
    if (!row) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }
    return row;
  }
}
