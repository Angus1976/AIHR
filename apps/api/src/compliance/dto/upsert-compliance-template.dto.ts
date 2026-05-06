import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertComplianceTemplateDto {
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
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  content!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
