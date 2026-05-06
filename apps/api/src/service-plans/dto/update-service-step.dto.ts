import { SeekerServiceStepStatus, ServiceProviderType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateServiceStepDto {
  @IsOptional()
  @IsEnum(SeekerServiceStepStatus)
  status?: SeekerServiceStepStatus;

  @IsOptional()
  @IsEnum(ServiceProviderType)
  providerType?: ServiceProviderType;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliverableSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  partnerOrgName?: string;
}
