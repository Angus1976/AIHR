import { OrderKind } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateWechatJsapiOrderDto {
  @IsInt()
  @Min(1)
  @Max(100_000_000)
  amountFen!: number;

  @IsEnum(OrderKind)
  kind!: OrderKind;

  @IsOptional()
  @IsString()
  @MaxLength(127)
  description?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  milestoneId?: string;
}
