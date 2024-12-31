import { IsOptional, IsString } from 'class-validator';

export class SearchMailDto {
  @IsOptional()
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  maxResults: number;
}