import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FilterExhibitionsDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  area?: string;
}
