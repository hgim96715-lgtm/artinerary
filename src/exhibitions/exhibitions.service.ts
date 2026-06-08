import { Injectable, NotFoundException } from '@nestjs/common';
import { ExhibitionFeeType, ExhibitionSource } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Injectable()
export class ExhibitionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.exhibition.findMany({
      where: {
        isVisible: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }
  async findOne(id: number) {
    const exhibition = await this.prisma.exhibition.findFirst({
      where: { id, isVisible: true },
    });

    if (!exhibition) {
      throw new NotFoundException(
        'Id에 맞는 전시회가 없습니다. 조회 불가능합니다.',
      );
    }
    return {
      message: `${exhibition.title} 전시회가 조회 되었습니다.`,
      data: exhibition,
    };
  }
  async createExhibition(dto: CreateExhibitionDto) {
    const created = await this.prisma.exhibition.create({
      data: {
        ...dto,
        source: ExhibitionSource.MANUAL,
        isVisible: dto.isVisible ?? true,
        feeType: dto.feeType ?? ExhibitionFeeType.UNKNOWN,
      },
    });
    return { message: '전시회가 생성 되었습니다.', id: created.id };
  }

  async updateExhibition(id: number, dto: UpdateExhibitionDto) {
    const exhibition = await this.prisma.exhibition.findUnique({
      where: { id },
    });
    if (!exhibition) {
      throw new NotFoundException(`수정하고 싶은 ${id}는 없는 Id입니다.`);
    }
    await this.prisma.exhibition.update({
      where: { id },
      data: dto,
    });
    return { message: '전시회가 수정 되었습니다.', id };
  }

  async deleteExhibition(id: number) {
    const exhibition = await this.prisma.exhibition.findUnique({
      where: { id },
    });
    if (!exhibition) {
      throw new NotFoundException(`삭제하고 싶은 ${id}는 없는 Id입니다.`);
    }
    await this.prisma.exhibition.delete({ where: { id } });
    return {
      message: '전시회가 삭제 되었습니다.',
      id,
    };
  }
}
