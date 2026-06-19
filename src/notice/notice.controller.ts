import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { NoticeService } from './notice.service';

@Controller('notice')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  findPublished() {
    return this.noticeService.findPublished();
  }
  @Get(':id')
  findPublishedById(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.findPublishedById(id);
  }
}
