import { IsBoolean, IsOptional } from 'class-validator';

export class ImproveServicePromptDto {
  @IsOptional()
  @IsBoolean()
  apply?: boolean;
}
