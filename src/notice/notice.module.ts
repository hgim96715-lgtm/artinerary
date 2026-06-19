import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NoticeController],
  providers: [NoticeService],
})
export class NoticeModule {}
