import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInterviewOpportunityDto {
  @IsString()
  jobPostingId!: string;

  @IsString()
  seekerUserId!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
