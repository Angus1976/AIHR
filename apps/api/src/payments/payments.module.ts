import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { CommerceModule } from '../commerce/commerce.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { OrdersController } from './orders.controller';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuditModule, AuthModule, CommerceModule, IntegrationsModule],
  controllers: [PaymentsController, OrdersController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
