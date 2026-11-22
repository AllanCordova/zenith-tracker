import { ConfigService } from '@nestjs/config';
import { MercadoPagoPaymentsGateway } from './mercadopago.gateway';

const createMock = jest.fn();

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
  Payment: jest.fn().mockImplementation(() => ({
    create: createMock,
  })),
}));

describe('MercadoPagoPaymentsGateway', () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: 12345, status: 'pending' });
  });

  it('chama payment.create mesmo com access token TEST- (sandbox)', async () => {
    const config = {
      getOrThrow: jest.fn().mockReturnValue('TEST-sandbox-access-token'),
    } as unknown as ConfigService;

    const gateway = new MercadoPagoPaymentsGateway(config);
    const result = await gateway.charge({
      token: 'card-token',
      amountCents: 4990,
      idempotencyKey: 'order-1-charge',
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      body: {
        transaction_amount: 49.9,
        token: 'card-token',
        installments: 1,
        payer: { email: 'treinador@zenith.local' },
      },
      requestOptions: { idempotencyKey: 'order-1-charge' },
    });
    expect(result).toEqual({
      gatewayPaymentId: '12345',
      status: 'pending',
    });
  });
});
