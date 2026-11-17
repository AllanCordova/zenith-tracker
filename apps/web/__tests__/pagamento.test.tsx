import { cleanup, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import PagamentoPage from "../app/treinador/pagamento/page";
import { http } from "@/lib/http";
import { saveSession } from "@/lib/session";
import * as billing from "@/repositories/billing";
import { renderWithQuery } from "./query-wrapper";

const { push, cardPayment } = vi.hoisted(() => ({
  push: vi.fn(),
  cardPayment: {
    onSubmit: null as null | (() => Promise<void>),
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
    onSubmit: () => Promise<void>;
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
  id: "order-pending-ca10",
  trainerId: "user-2",
  planCode: "MONTHLY",
  amountCents: 4990,
  status: "PENDING",
  createdAt: "2026-11-16T00:00:00.000Z",
};

test("montar /treinador/pagamento e acionar onSubmit não marca Pedido como pago nem chama cobrança (CA10)", async () => {
  saveTrainerSession();

  const getCurrentOrder = vi
    .spyOn(billing, "getCurrentOrder")
    .mockResolvedValue(pendingOrder);
  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });
  const createOrder = vi
    .spyOn(billing, "createOrder")
    .mockResolvedValue(pendingOrder);
  const httpPost = vi.spyOn(http, "post").mockResolvedValue({
    status: 201,
    data: { data: pendingOrder },
  } as never);

  const { unmount } = renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeTruthy();
    expect(cardPayment.onSubmit).toBeTypeOf("function");
  });

  await cardPayment.onSubmit!();

  expect(createOrder).not.toHaveBeenCalled();
  expect(httpPost).not.toHaveBeenCalled();

  unmount();

  expect(getCurrentOrder).toHaveBeenCalled();
  const stillPending = await billing.getCurrentOrder();
  expect(stillPending?.status).toBe("PENDING");
  expect(stillPending?.id).toBe(pendingOrder.id);
  expect(createOrder).not.toHaveBeenCalled();
  expect(httpPost).not.toHaveBeenCalled();
  expect("chargeOrder" in billing).toBe(false);
  expect("createPayment" in billing).toBe(false);
});
