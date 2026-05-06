import { Body, Controller, Post } from '@nestjs/common';
import { SendSmsOtpDto } from './dto/send-sms-otp.dto';
import { VerifySmsOtpDto } from './dto/verify-sms-otp.dto';
import { SmsService } from './sms.service';

@Controller('auth/sms')
export class SmsController {
  constructor(private readonly sms: SmsService) {}

  @Post('send')
  send(@Body() dto: SendSmsOtpDto) {
    return this.sms.sendOtp(dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifySmsOtpDto) {
    return this.sms.verifyOtp(dto);
  }
}
