import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const EXHIBITION_LIST_STATUSES = [
  'ongoing',
  'upcoming',
  'ended',
] as const;

export type ExhibitionListStatus = (typeof EXHIBITION_LIST_STATUSES)[number];
export class FilterExhibitionsDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  area?: string;

  @IsOptional()
  @IsIn(EXHIBITION_LIST_STATUSES)
  status?: ExhibitionListStatus;
}
