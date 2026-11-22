import { BadGatewayException } from '@nestjs/common';
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
  const config = {
    getOrThrow: jest.fn().mockReturnValue('TEST-sandbox-access-token'),
  } as unknown as ConfigService;

  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: 12345, status: 'pending' });
  });

  it('chama payment.create com o e-mail do pagador (sandbox)', async () => {
    const gateway = new MercadoPagoPaymentsGateway(config);
    const result = await gateway.charge({
      token: 'card-token',
      amountCents: 4990,
      idempotencyKey: 'order-1-charge',
      payerEmail: 'treinador@example.com',
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      body: {
        transaction_amount: 49.9,
        token: 'card-token',
        installments: 1,
        payer: { email: 'treinador@example.com' },
      },
      requestOptions: { idempotencyKey: 'order-1-charge' },
    });
    expect(result).toEqual({
      gatewayPaymentId: '12345',
      status: 'pending',
    });
  });

  it('converte falha do SDK em BadGatewayException com detalhe', async () => {
    createMock.mockRejectedValue(
      new Error('Unauthorized use of live credentials'),
    );
    const gateway = new MercadoPagoPaymentsGateway(config);

    await expect(
      gateway.charge({
        token: 'card-token',
        amountCents: 4990,
        idempotencyKey: 'order-1-charge',
        payerEmail: 'treinador@example.com',
      }),
    ).rejects.toMatchObject({
      response: {
        message:
          'Não deu certo cobrar no gateway: Unauthorized use of live credentials',
      },
    });
    await expect(
      gateway.charge({
        token: 'card-token',
        amountCents: 4990,
        idempotencyKey: 'order-1-charge',
        payerEmail: 'treinador@example.com',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
