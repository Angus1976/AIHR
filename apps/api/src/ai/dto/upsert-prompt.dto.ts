import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertPromptDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32000)
  body!: string;
}
