import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MockInterviewSceneMode, MockInterviewTransport } from '@prisma/client';

export class CreateMockInterviewDto {
  @IsOptional()
  @IsString()
  servicePlanId?: string;

  @IsOptional()
  @IsEnum(MockInterviewTransport)
  transport?: MockInterviewTransport;

  @IsOptional()
  @IsEnum(MockInterviewSceneMode)
  sceneMode?: MockInterviewSceneMode;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  interviewerRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  interviewerRequirements?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evaluationFocus?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  antiAssistRules?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  vrSceneKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  vrSceneName?: string;
}
