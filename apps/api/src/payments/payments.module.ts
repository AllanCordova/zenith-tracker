import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import { MercadoPagoPaymentsGateway } from './mercadopago.gateway';
import { PaymentsController } from './payments.controller';
import { PaymentsGateway } from './payments.gateway';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PrismaService,
    {
      provide: PaymentsGateway,
      useClass: MercadoPagoPaymentsGateway,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
