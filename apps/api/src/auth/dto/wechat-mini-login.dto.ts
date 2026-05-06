import { IsOptional, IsString, Length } from 'class-validator';

export class WechatMiniLoginDto {
  @IsString()
  @Length(4, 256)
  code!: string;

  /** 多租户下可传 slug；单租户可用环境变量默认 */
  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
