import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RequestServiceStepDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  inputText?: string;
}
