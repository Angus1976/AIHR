import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  skillsText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32000)
  resumeMarkdown?: string;
}
