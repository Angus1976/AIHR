import { PartnerApplicationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewPartnerApplicationDto {
  @IsEnum(PartnerApplicationStatus)
  status!: PartnerApplicationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNote?: string;
}
