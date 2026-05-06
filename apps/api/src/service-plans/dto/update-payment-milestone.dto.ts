import { PaymentMilestoneStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdatePaymentMilestoneDto {
  @IsOptional()
  @IsEnum(PaymentMilestoneStatus)
  status?: PaymentMilestoneStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  amountFen?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  triggerText?: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}
