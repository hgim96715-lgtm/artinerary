import {
  Prisma,
  type Exhibition,
  ExhibitionSource,
} from 'generated/prisma/client';

/** 수집 update 시 DB에 값이 있으면 덮어쓰지 않는 필드 */
export const PRESERVE_IF_SET_FIELDS = [
  'description',
  'sourceUrl',
  'imageUrl',
] as const;

type PreserveField = (typeof PRESERVE_IF_SET_FIELDS)[number];

/** 수집 시 수집된 데이터 */
type CollectedExhibitionData = Prisma.ExhibitionUpdateInput;

export function preserveIfSet(
  existing: string | null | undefined,
  incoming: string | null | undefined,
): string | null {
  const existingTrimmed = existing?.trim();

  if (existingTrimmed) {
    return existingTrimmed;
  }

  return incoming?.trim() || null;
}

/**
 * API 행 재수집 시 update payload.
 * - description / sourceUrl / imageUrl: DB에 값 있으면 유지
 * - isVisible: admin 설정 유지
 */
export function buildCollectorUpdate(
  existing: Exhibition | null,
  incoming: CollectedExhibitionData,
): Prisma.ExhibitionUpdateInput {
  const update: Prisma.ExhibitionUpdateInput = {
    title: incoming.title as string,
    startDate: incoming.startDate as Date,
    endDate: incoming.endDate as Date,
    priceText: incoming.priceText as string | null | undefined,
    feeType: incoming.feeType,
    venueName: incoming.venueName as string | null | undefined,
    area: incoming.area as string | null | undefined,
    address: incoming.address as string | null | undefined,
    latitude: incoming.latitude as number | null | undefined,
    longitude: incoming.longitude as number | null | undefined,
    source: ExhibitionSource.API,
  };
  if (existing) {
    for (const field of PRESERVE_IF_SET_FIELDS) {
      (update as Record<PreserveField, string | null>)[field] = preserveIfSet(
        existing[field],
        incoming[field] as string | null | undefined,
      ) as string | null;
    }
    update.isVisible = existing.isVisible;
  } else {
    update.description = incoming.description as string | null | undefined;
    update.sourceUrl = incoming.sourceUrl as string | null | undefined;
    update.imageUrl = incoming.imageUrl as string | null | undefined;
    update.isVisible = true;
  }
  return update;
}

type ManualMatchExhibition = Pick<
  Exhibition,
  'title' | 'startDate' | 'endDate' | 'venueName' | 'source' | 'externalId'
>;

type IncomingMatchData = Pick<
  Prisma.ExhibitionCreateInput,
  'title' | 'startDate' | 'endDate' | 'venueName'
>;

/**
 * externalId 없는 MANUAL이 수집 건과 같은 전시로 보이면 true.
 *  혹시 관리자가 API에 없는 줄 알고 생성했는데 API 수집에 있는 건이라면 이 건을 수정하는 것으로 처리. > 오류방지
 * - 시작일·종료일 일치
 * - 제목 정규화 후 일치
 * - 장소 둘 다 있으면 일치해야 함 (한쪽만 비어 있으면 OK)
 */

export function normalizeMatchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/*
manual이 API 수집 전시랑 같은지 확인하는 함수
같으면 true(중복), 다르면 false(중복 아님)
*/
export function isManualDuplicateOf(
  manual: ManualMatchExhibition,
  incoming: IncomingMatchData,
): boolean {
  if (manual.source !== ExhibitionSource.MANUAL || manual.externalId) {
    return false;
  }
  const inStart = incoming.startDate as Date;
  const inEnd = incoming.endDate as Date;
  if (
    manual.startDate.getTime() !== inStart.getTime() ||
    manual.endDate.getTime() !== inEnd.getTime()
  ) {
    return false;
  }
  if (normalizeMatchText(manual.title) !== normalizeMatchText(incoming.title)) {
    return false;
  }
  const manualVenue = manual.venueName?.trim();
  const incomingVenu = (
    incoming.venueName as string | null | undefined
  )?.trim();
  if (
    manualVenue &&
    incomingVenu &&
    normalizeMatchText(manualVenue) !== normalizeMatchText(incomingVenu)
  ) {
    return false;
  }
  return true;
}
/** 같은 API 키 행이 MANUAL이면 수집 upsert 스킵해야한다. */
export function shouldSkipCollectorUpsert(
  existing: Exhibition | null,
): boolean {
  return existing?.source === ExhibitionSource.MANUAL;
}
