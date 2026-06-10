import { Module } from '@nestjs/common';
import { ExhibitionsService } from './exhibitions.service';
import { ExhibitionsController } from './exhibitions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ExhibitionsService],
  controllers: [ExhibitionsController],
})
export class ExhibitionsModule {}
