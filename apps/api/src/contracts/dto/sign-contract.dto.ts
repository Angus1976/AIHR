import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SignContractDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  signatureRef?: string;
}
