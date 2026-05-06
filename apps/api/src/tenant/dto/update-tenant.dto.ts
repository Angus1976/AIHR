import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  accentColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  welcomeText?: string;
}
