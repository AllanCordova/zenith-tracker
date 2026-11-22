import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import {
  PaymentsGateway,
  type ChargeInput,
  type ChargeResult,
} from './payments.gateway';

@Injectable()
export class MercadoPagoPaymentsGateway extends PaymentsGateway {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    const accessToken = this.config.getOrThrow<string>('PAGAMENTO_ACCESS_TOKEN');
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const result = await payment.create({
      body: {
        transaction_amount: input.amountCents / 100,
        token: input.token,
        installments: 1,
        payer: { email: 'treinador@zenith.local' },
      },
      requestOptions: { idempotencyKey: input.idempotencyKey },
    });

    return {
      gatewayPaymentId: String(result.id),
      status: result.status ?? 'pending',
    };
  }
}
