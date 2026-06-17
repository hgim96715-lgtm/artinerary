import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/config/env.keys';
import { randomUUID } from 'crypto';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class S3StorageService {
  private client: S3Client | null = null;
  constructor(private readonly configService: ConfigService) {}
  private getConfig() {
    const accountId = this.configService.getOrThrow<string>(
      EnvKeys.S3_ACCOUNT_ID,
    );
    const accessKeyId = this.configService.getOrThrow<string>(
      EnvKeys.S3_ACCESS_KEY_ID,
    );
    const secretAccessKey = this.configService.getOrThrow<string>(
      EnvKeys.S3_SECRET_ACCESS_KEY,
    );
    const endpoint = this.configService.getOrThrow<string>(EnvKeys.S3_ENDPOINT);
    const bucket = this.configService.getOrThrow<string>(EnvKeys.S3_BUCKET);
    const publicUrl = this.configService.getOrThrow<string>(
      EnvKeys.S3_PUBLIC_URL,
    );
    if (
      !accessKeyId ||
      !secretAccessKey ||
      !endpoint ||
      !bucket ||
      !publicUrl
    ) {
      throw new ServiceUnavailableException(
        '사진 업로드 설정이 되어 있지 않습니다.',
      );
    }
    return {
      accountId,
      accessKeyId,
      secretAccessKey,
      endpoint,
      bucket,
      publicUrl,
    };
  }
  private getClient() {
    if (!this.client) {
      const { accountId, accessKeyId, secretAccessKey, endpoint } =
        this.getConfig();
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
    return this.client;
  }
  async uploadVisitPhoto(userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('사진 파일이 없습니다.');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        '지원하지 않는 파일 형식입니다.jpeg, png, webp만 업로드할 수 있습니다. ',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException(
        '파일 크기가 너무 큽니다. 최대 5MB까지 업로드할 수 있습니다.',
      );
    }
    const { bucket, publicUrl } = this.getConfig();
    const ext =
      file.mimetype === 'image/jpeg'
        ? 'jpg'
        : file.mimetype === 'image/png'
          ? 'png'
          : 'webp';
    const key = `visits/${userId}/${randomUUID()}.${ext}`;
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    const base = publicUrl.replace(/\/$/, '');
    return { url: `${base}/${key}` };
  }
}
