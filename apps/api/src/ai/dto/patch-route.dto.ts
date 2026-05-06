import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class PatchRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  scenario?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  provider?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  modelName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  baseUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  apiKeyEnv?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
