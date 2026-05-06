import { InterviewOpportunityStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class RespondInterviewOpportunityDto {
  @IsEnum(InterviewOpportunityStatus)
  status!: InterviewOpportunityStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
