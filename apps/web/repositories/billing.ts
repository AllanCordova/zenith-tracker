import { http } from "@/lib/http";

export type PlanCode = "MONTHLY" | "YEARLY";

export type BillingPlan = {
  planCode: PlanCode;
  amountCents: number;
};

export type Order = {
  id: string;
  trainerId: string;
  planCode: PlanCode;
  amountCents: number;
  status: "PENDING" | "PAID" | "REFUSED" | "EXPIRED";
  createdAt: string;
};

export type CheckoutConfig = {
  publicKey: string;
};

export type Payment = {
  id: string;
  orderId: string;
  gatewayPaymentId: string;
  status: string;
  receivedAt: string;
};

export type Subscription = {
  id: string;
  trainerId: string;
  orderId: string;
  planCode: PlanCode;
  status: "ACTIVE" | "INACTIVE";
  activatedAt: string;
};

type Envelope<T> = {
  data?: T;
};

export async function listPlans(): Promise<BillingPlan[]> {
  const response = await http.get<Envelope<BillingPlan[]>>("/billing/plans");
  return response.data.data ?? [];
}

type ErrorEnvelope = {
  statusCode?: number;
  message?: string | string[];
};

export async function createOrder(input: {
  planCode: PlanCode;
}): Promise<Order | undefined> {
  const response = await http.post<Envelope<Order> & ErrorEnvelope>(
    "/billing/orders",
    input,
  );
  if (response.status === 409) {
    const message = response.data.message;
    const text = Array.isArray(message) ? message.join(" ") : message;
    throw new Error(text ?? "Assinatura já está ativa neste plano");
  }
  return response.data.data;
}

export async function getCurrentOrder(): Promise<Order | undefined> {
  const response = await http.get<Envelope<Order>>("/billing/orders/current");
  if (response.status === 404) {
    return undefined;
  }
  return response.data.data;
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  const response = await http.get<Envelope<Subscription>>(
    "/billing/subscription/current",
  );
  if (response.status === 404) {
    return null;
  }
  return response.data.data ?? null;
}

export async function getCheckoutConfig(): Promise<CheckoutConfig | undefined> {
  const response = await http.get<Envelope<CheckoutConfig>>(
    "/billing/checkout-config",
  );
  return response.data.data;
}

export async function chargeOrder(input: {
  orderId: string;
  token: string;
}): Promise<Payment | undefined> {
  const response = await http.post<Envelope<Payment> & ErrorEnvelope>(
    `/billing/orders/${input.orderId}/charge`,
    { token: input.token },
  );
  if (response.status >= 400) {
    const message = response.data.message;
    const text = Array.isArray(message) ? message.join(" ") : message;
    throw new Error(text ?? "Não deu certo cobrar o pedido");
  }
  return response.data.data;
}
