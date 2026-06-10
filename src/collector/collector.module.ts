import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CollectorService } from './collector.service';
import { CultureApiClient } from './culture-api.client';
import { CollectorController } from './collector.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CollectorService, CultureApiClient],
  controllers: [CollectorController],
  exports: [CollectorService],
})
export class CollectorModule {}
