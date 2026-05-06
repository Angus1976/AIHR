import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContractDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  enterpriseId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  jobApplicationId?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;
}
