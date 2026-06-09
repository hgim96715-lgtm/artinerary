import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CollectorService } from './collector.service';
import { CultureApiClient } from './culture-api.client';
import { CollectorController } from './collector.controller';

@Module({
  imports: [PrismaModule],
  providers: [CollectorService, CultureApiClient],
  controllers: [CollectorController],
  exports: [CollectorService],
})
export class CollectorModule {}
