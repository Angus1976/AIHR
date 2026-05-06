import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePartnerApplicationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  orgName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  contactName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  contactEmail?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  category!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  qualification?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  courseSummary?: string;
}
