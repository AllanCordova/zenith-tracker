export type ChargeInput = {
  token: string;
  amountCents: number;
  idempotencyKey: string;
  payerEmail: string;
};

export type ChargeResult = {
  gatewayPaymentId: string;
  status: string;
};

export abstract class PaymentsGateway {
  abstract charge(input: ChargeInput): Promise<ChargeResult>;
}
