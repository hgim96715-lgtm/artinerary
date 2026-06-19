import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

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
  async findAllForAdmin() {
    return this.prisma.notice.findMany({
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        isPublished: true,
        isPinned: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOneForAdmin(id: number) {
    const row = await this.prisma.notice.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }
    return row;
  }

  async createNotice(dto: CreateNoticeDto) {
    const isPublished = dto.isPublished ?? false;
    const created = await this.prisma.notice.create({
      data: {
        title: dto.title,
        body: dto.body,
        isPinned: dto.isPinned ?? false,
        isPublished,
        publishedAt: isPublished ? (dto.publishedAt ?? new Date()) : null,
      },
    });
    return { message: '공지가 생성되었습니다.', id: created.id };
  }

  async updateNotice(id: number, dto: UpdateNoticeDto) {
    const current = await this.prisma.notice.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    const nextPublished =
      dto.isPublished !== undefined ? dto.isPublished : current.isPublished;

    let publishedAt = current.publishedAt;
    if (!nextPublished) {
      publishedAt = null;
    } else if (dto.publishedAt !== undefined) {
      publishedAt = dto.publishedAt;
    } else if (!current.isPublished) {
      publishedAt = new Date();
    }

    await this.prisma.notice.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.isPinned !== undefined ? { isPinned: dto.isPinned } : {}),
        isPublished: nextPublished,
        publishedAt,
      },
    });
    return { message: '공지가 수정되었습니다.', id };
  }

  async deleteNotice(id: number) {
    const row = await this.prisma.notice.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }
    await this.prisma.notice.delete({ where: { id } });
    return { message: '공지가 삭제되었습니다.', id };
  }
}
