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

export class CreateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  scenario?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  provider!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  modelName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  baseUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  apiKeyEnv?: string;

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
