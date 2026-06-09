import { Inject, Injectable, type LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';
import { CultureApiClient } from './culture-api.client';
import { CULTURE_API_PROVIDER } from './culture-api.types';
import { isExhibitionItem, mergeToExhibitionData } from './culture.mapper';

export type CollectResult = {
  listed: number;
  filtered: number;
  upserted: number;
  skipped: number;
  failed: number;
};

@Injectable()
export class CollectorService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly cultureApiClient: CultureApiClient,
    private readonly prisma: PrismaService,
  ) {}

  collectAll = async (opts?: { pageSize?: number; delayMs?: number }) => {
    const pageSize = opts?.pageSize ?? 100;
    const delayMs = opts?.delayMs ?? 1000;
    const result: CollectResult = {
      listed: 0,
      filtered: 0,
      upserted: 0,
      skipped: 0,
      failed: 0,
    };

    this.logger.log(
      `문화 API 전시 수집을 시작합니다 (페이지당 ${pageSize}건, 요청 간격 ${delayMs}ms)`,
    );

    const first = await this.cultureApiClient.fetchPeriod2Page(1, pageSize);
    const totalPages = Math.max(1, Math.ceil(first.totalCount / pageSize));

    this.logger.log(
      `목록 전체 ${first.totalCount}건, ${totalPages}페이지를 순회합니다`,
    );

    for (let page = 1; page <= totalPages; page++) {
      const { items } =
        page === 1
          ? first
          : await this.cultureApiClient.fetchPeriod2Page(page, pageSize);

      result.listed += items.length;

      for (const item of items) {
        if (!isExhibitionItem(item)) {
          result.filtered++;
          continue;
        }

        const seq = item.seq?.toString();
        if (!seq) {
          result.skipped++;
          continue;
        }

        try {
          if (delayMs > 0) await sleep(delayMs);

          const detail = await this.cultureApiClient.fetchDetailItem(seq);
          const data = mergeToExhibitionData(item, detail);
          if (!data) {
            result.skipped++;
            this.logger.warn(`seq ${seq}: 필수 필드가 없어 건너뜁니다`);
            continue;
          }

          await this.prisma.exhibition.upsert({
            where: {
              apiProvider_externalId: {
                apiProvider: CULTURE_API_PROVIDER,
                externalId: seq,
              },
            },
            create: data,
            update: {
              title: data.title,
              description: data.description,
              imageUrl: data.imageUrl,
              sourceUrl: data.sourceUrl,
              startDate: data.startDate,
              endDate: data.endDate,
              priceText: data.priceText,
              feeType: data.feeType,
              venueName: data.venueName,
              area: data.area,
              address: data.address,
              latitude: data.latitude,
              longitude: data.longitude,
              isVisible: true,
              source: data.source,
            },
          });

          result.upserted++;
        } catch (error) {
          result.failed++;
          this.logger.warn(
            `seq ${seq}: 수집 실패 — ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      this.logger.log(
        `${page}/${totalPages}페이지 완료 (누적: 저장 ${result.upserted}, 건너뜀 ${result.skipped}, 실패 ${result.failed})`,
      );
    }

    this.logger.log(
      `전시 수집을 마쳤습니다 — 저장 ${result.upserted}건, 공연 등 제외 ${result.filtered}건, 건너뜀 ${result.skipped}건, 실패 ${result.failed}건`,
    );

    return result;
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
