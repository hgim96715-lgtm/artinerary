import { XMLParser } from 'fast-xml-parser';
import { CultureDetailItem, CultureListItem } from './culture-api.types';

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: false,
  isArray: (tagName) => tagName === 'item',
});

export const parseCultureResponse = (xml: string) => {
  const parsed = parser.parse(xml) as {
    response?: {
      header?: {
        resultCode?: string;
        resultMsg?: string;
      };
      body?: Record<string, unknown>;
    };
  };
  const header = parsed.response?.header;
  const body = parsed.response?.body;

  if (!header || header.resultCode !== '00') {
    throw new Error(
      `API ERROR :${header?.resultCode ?? 'UNKNOWN'} ${header?.resultMsg ?? ''}`,
    );
  }
  return body ?? {};
};

export const parseListItems = (xml: string) => {
  const body = parseCultureResponse(xml);
  const totalCount = Number(body.totalCount ?? 0);
  const items =
    (body.items as { item?: CultureListItem[] } | undefined)?.item ?? [];

  return { totalCount, items };
};

export const parseDetailItem = (xml: string) => {
  const body = parseCultureResponse(xml);
  const item =
    (body.items as { item?: CultureDetailItem[] } | undefined)?.item?.[0] ??
    null;
  return item;
};
