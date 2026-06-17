import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { CollectorModule } from './collector/collector.module';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import { AuthModule } from './auth/auth.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { VisitModule } from './visit/visit.module';
import { MeStatusModule } from './me-status/me-status.module';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadModule } from './upload/upload.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const rest = Object.keys(meta).length
                ? ` ${JSON.stringify(meta)}`
                : '';
              return `${timestamp} [${level}] ${message}${rest}`;
            }),
          ),
        }),
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { convert: true },
    }),
    PrismaModule,
    ExhibitionsModule,
    CollectorModule,
    AuthModule,
    WishlistModule,
    VisitModule,
    MeStatusModule,
    AdminModule,
    UploadModule,
  ],
})
export class AppModule {}
