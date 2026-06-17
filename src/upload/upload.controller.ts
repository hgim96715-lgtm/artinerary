import { Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'generated/prisma/client';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class UploadController {
  constructor(private readonly s3StorageService: S3StorageService) {}

  @Post('visit-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadVisitPhoto(
    @Req() req: { user: JwtPayload },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.s3StorageService.uploadVisitPhoto(req.user.sub, file);
  }
}
