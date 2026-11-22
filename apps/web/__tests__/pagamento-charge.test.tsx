import { cleanup, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import PagamentoPage from "../app/treinador/pagamento/page";
import { saveSession } from "@/lib/session";
import * as billing from "@/repositories/billing";
import { renderWithQuery } from "./query-wrapper";

const { push, cardPayment } = vi.hoisted(() => ({
  push: vi.fn(),
  cardPayment: {
    onSubmit: null as null | ((formData: { token: string }) => Promise<void>),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@mercadopago/sdk-react", () => ({
  initMercadoPago: vi.fn(),
  CardPayment: ({
    onSubmit,
    initialization,
  }: {
    onSubmit: (formData: { token: string }) => Promise<void>;
    initialization: { amount: number };
  }) => {
    cardPayment.onSubmit = onSubmit;
    return (
      <div data-testid="mp-card-form" data-amount={String(initialization.amount)}>
        formulário Mercado Pago
      </div>
    );
  },
}));

beforeEach(() => {
  cleanup();
  localStorage.clear();
  push.mockReset();
  cardPayment.onSubmit = null;
  vi.restoreAllMocks();
});

function saveTrainerSession() {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });
}

const pendingOrder: billing.Order = {
  id: "order-pending-ca1",
  trainerId: "user-2",
  planCode: "MONTHLY",
  amountCents: 4990,
  status: "PENDING",
  createdAt: "2026-11-16T00:00:00.000Z",
};

test("onSubmit chama charge e navega para /treinador/pagamento/status (CA1)", async () => {
  saveTrainerSession();

  vi.spyOn(billing, "getCurrentOrder").mockResolvedValue(pendingOrder);
  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });
  const chargeOrder = vi.spyOn(billing, "chargeOrder").mockResolvedValue({
    id: "payment-1",
    orderId: pendingOrder.id,
    gatewayPaymentId: "gw-1",
    status: "pending",
    receivedAt: "2026-11-22T00:00:00.000Z",
  });

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeTruthy();
    expect(cardPayment.onSubmit).toBeTypeOf("function");
  });

  await cardPayment.onSubmit!({ token: "card-token-ca1" });

  await waitFor(() => {
    expect(chargeOrder).toHaveBeenCalledWith({
      orderId: pendingOrder.id,
      token: "card-token-ca1",
    });
    expect(push).toHaveBeenCalledWith("/treinador/pagamento/status");
  });
});

test("falha de charge mostra erro e não navega para status", async () => {
  saveTrainerSession();

  vi.spyOn(billing, "getCurrentOrder").mockResolvedValue(pendingOrder);
  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });
  vi.spyOn(billing, "chargeOrder").mockRejectedValue(
    new Error("Não deu certo cobrar o pedido"),
  );

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeTruthy();
    expect(cardPayment.onSubmit).toBeTypeOf("function");
  });

  await cardPayment.onSubmit!({ token: "card-token-fail" });

  await waitFor(() => {
    expect(screen.getByRole("alert").textContent).toMatch(
      /Não deu certo cobrar o pedido/i,
    );
  });
  expect(push).not.toHaveBeenCalled();
});
