import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UploadController } from './upload.controller';
import { S3StorageService } from './s3-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [S3StorageService],
  exports: [S3StorageService],
})
export class UploadModule {}
