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

vi.mock("next/dynamic", () => ({
  default: () =>
    function MercadoPagoCardPaymentMock({
      onSubmit,
      amount,
    }: {
      onSubmit: (formData: { token: string }) => Promise<void>;
      amount: number;
      publicKey: string;
    }) {
      cardPayment.onSubmit = onSubmit;
      return (
        <div data-testid="mp-card-form" data-amount={String(amount)}>
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

test("onSubmit chama charge e navega para /treinador/pagamento/status", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });
  vi.spyOn(billing, "getCurrentOrder").mockResolvedValue({
    id: "order-1",
    trainerId: "user-2",
    planCode: "MONTHLY",
    amountCents: 4990,
    status: "PENDING",
    createdAt: "2026-11-17T00:00:00.000Z",
  });
  const charge = vi.spyOn(billing, "chargeOrder").mockResolvedValue({
    id: "pay-1",
    orderId: "order-1",
    gatewayPaymentId: "gw-1",
    status: "pending",
    receivedAt: "2026-11-17T00:00:00.000Z",
  });

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeDefined();
  });

  expect(cardPayment.onSubmit).toBeTypeOf("function");
  await cardPayment.onSubmit!({ token: "card-token" });

  await waitFor(() => {
    expect(charge).toHaveBeenCalledWith({
      orderId: "order-1",
      token: "card-token",
    });
    expect(push).toHaveBeenCalledWith("/treinador/pagamento/status");
  });
});

test("falha no charge não navega e mostra erro", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });
  vi.spyOn(billing, "getCurrentOrder").mockResolvedValue({
    id: "order-1",
    trainerId: "user-2",
    planCode: "MONTHLY",
    amountCents: 4990,
    status: "PENDING",
    createdAt: "2026-11-17T00:00:00.000Z",
  });
  vi.spyOn(billing, "chargeOrder").mockRejectedValue(
    new Error("Não deu certo cobrar o pedido"),
  );

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeDefined();
  });

  await cardPayment.onSubmit!({ token: "card-token" });

  await waitFor(() => {
    expect(screen.getByRole("alert").textContent).toMatch(
      /Não deu certo cobrar o pedido/i,
    );
  });
  expect(push).not.toHaveBeenCalled();
});
