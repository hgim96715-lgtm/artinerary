import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKeys } from 'src/config/env.keys';
import { parseDetailItem, parseListItems } from './culture-xml.parser';
import { CultureDetailItem, CultureListItem } from './culture-api.types';

@Injectable()
export class CultureApiClient {
  constructor(private readonly configService: ConfigService) {}

  private get baseUrl() {
    return this.configService.getOrThrow<string>(
      EnvKeys.API_EXHIBITION_BASE_URL,
    );
  }

  private get serviceKey() {
    return this.configService.getOrThrow<string>(EnvKeys.API_EXHIBITION_KEY);
  }

  private buildUrl(endpoint: string, params: Record<string, string | number>) {
    const base = this.baseUrl.replace(/\/$/, '');
    const url = new URL(`${base}/${endpoint}`);
    url.searchParams.set('serviceKey', this.serviceKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  fetchPeriod2Page = async (pageNo: number, numOfrows = 100) => {
    const url = this.buildUrl('period2', {
      PageNo: pageNo,
      numOfrows,
      serviceTp: 'A',
    });
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `period2 HTTP error! status: ${res.status}: ${url} ${res.statusText}`,
      );
    }
    const xml = await res.text();
    return parseListItems(xml) as {
      totalCount: number;
      items: CultureListItem[];
    };
  };

  fetchDetailItem = async (seq: string) => {
    const url = this.buildUrl('detail2', { seq });
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `detail2 HTTP error! status: ${res.status}: ${url} ${res.statusText}`,
      );
    }
    const xml = await res.text();
    return parseDetailItem(xml) as CultureDetailItem | null;
  };
}
