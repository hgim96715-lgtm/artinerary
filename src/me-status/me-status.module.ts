import { Module } from '@nestjs/common';
import { MeStatusService } from './me-status.service';
import { ExhibitionMeStatusController } from './me-status.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExhibitionMeStatusController],
  providers: [MeStatusService],
})
export class MeStatusModule {}
