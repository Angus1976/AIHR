import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateConsentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  purpose!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  version!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  content!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
