import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  enterpriseId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  jdMarkdown?: string;
}
