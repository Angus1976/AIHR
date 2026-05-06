import { RefundRequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewRefundRequestDto {
  @IsEnum(RefundRequestStatus)
  status!: RefundRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reviewNote?: string;
}
