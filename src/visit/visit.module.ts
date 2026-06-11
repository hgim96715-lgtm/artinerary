import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import {
  ExhibitionVisitController,
  MeVisitController,
  VisitController,
} from './visit.controller';
import { VisitService } from './visit.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MeVisitController, ExhibitionVisitController, VisitController],
  providers: [VisitService],
})
export class VisitModule {}
