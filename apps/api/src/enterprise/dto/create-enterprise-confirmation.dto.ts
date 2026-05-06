import { EnterpriseConfirmationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEnterpriseConfirmationDto {
  @IsString()
  enterpriseId!: string;

  @IsEnum(EnterpriseConfirmationType)
  type!: EnterpriseConfirmationType;

  @IsOptional()
  @IsString()
  jobPostingId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  /** 线下留痕：附件在对象存储中的 key 或外链 */
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  evidenceRef?: string;
}
