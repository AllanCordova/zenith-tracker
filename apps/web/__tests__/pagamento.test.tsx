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

function saveTrainerSession() {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });
}

const pendingOrder: billing.Order = {
  id: "order-pending-ca10",
  trainerId: "user-2",
  planCode: "MONTHLY",
  amountCents: 4990,
  status: "PENDING",
  createdAt: "2026-11-16T00:00:00.000Z",
};

test("montar /treinador/pagamento mostra o formulário com amount do Pedido PENDING", async () => {
  saveTrainerSession();

  vi.spyOn(billing, "getCurrentOrder").mockResolvedValue(pendingOrder);
  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeTruthy();
    expect(screen.getByTestId("mp-card-form").getAttribute("data-amount")).toBe(
      "49.9",
    );
  });
});
