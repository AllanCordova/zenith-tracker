import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
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
    try {
      const result = await payment.create({
        body: {
          transaction_amount: input.amountCents / 100,
          token: input.token,
          installments: 1,
          payer: { email: input.payerEmail },
        },
        requestOptions: { idempotencyKey: input.idempotencyKey },
      });

      return {
        gatewayPaymentId: String(result.id),
        status: result.status ?? 'pending',
      };
    } catch (error: unknown) {
      const detail = mercadoPagoErrorDetail(error);
      throw new BadGatewayException(
        detail
          ? `Não deu certo cobrar no gateway: ${detail}`
          : 'Não deu certo cobrar no gateway de pagamento',
      );
    }
  }
}

function mercadoPagoErrorDetail(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }
  const message = 'message' in error ? error.message : undefined;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message.trim().slice(0, 200);
  }
  return undefined;
}
