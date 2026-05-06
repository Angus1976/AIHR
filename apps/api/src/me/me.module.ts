import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { MockInterviewController } from './mock-interview.controller';
import { MockInterviewService } from './mock-interview.service';

@Module({
  imports: [AuthModule, PrismaModule, IntegrationsModule],
  controllers: [MeController, MockInterviewController],
  providers: [MeService, MockInterviewService],
})
export class MeModule {}
