import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageService } from './s3-storage.service';

describe('S3StorageService', () => {
  let service: S3StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3StorageService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: () => 'test',
          },
        },
      ],
    }).compile();

    service = module.get(S3StorageService);
  });

  it('mime 불일치 시 BadRequest', async () => {
    await expect(
      service.uploadVisitPhoto(1, {
        mimetype: 'application/pdf',
        size: 100,
        buffer: Buffer.from(''),
      } as Express.Multer.File),
    ).rejects.toThrow(BadRequestException);
  });
});
