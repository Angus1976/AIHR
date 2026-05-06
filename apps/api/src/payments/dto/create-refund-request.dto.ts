import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateRefundRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000_000)
  amountFen!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
