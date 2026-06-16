import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/config/env.keys';
import { Exhibition } from 'generated/prisma/client';

@Injectable()
export class ExhibitionAiService {
  private client: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>(EnvKeys.ANTHROPIC_API_KEY);
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  async generateDescription(exhibition: Exhibition): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'ANTHROPIC_API_KEY가 설정되지 않았습니다.',
      );
    }
    const start = exhibition.startDate.toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });
    const end = exhibition.endDate.toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });
    const place = [exhibition.venueName, exhibition.area, exhibition.address]
      .filter(Boolean)
      .join(' · ');
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `전시 목록·상세에 넣을 짧은 소개만 써줘.
                
                규칙:
                - 2~4문장, 한국어
                - 사실만. 모르는 내용 지어내지 말 것
                - 상세·티켓·주차 등은 쓰지 말고 "자세한 내용은 전시 홈페이지를 참고해 주세요."로 끝낼 것
                - 따옴표·제목·머리말 없이 본문만
                전시 정보:
            ${exhibition.title}
            ${place || '미상'}
            ${start} ~ ${end}
            ${exhibition.priceText ?? '미상'}
            `,
        },
      ],
    });
    const block = message.content.find((b) => b.type === 'text');
    const text = block?.type === 'text' ? block.text.trim() : '';
    if (!text) {
      throw new ServiceUnavailableException('AI 응답이 비어 있습니다.');
    }
    return text;
  }
}
