import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import AssinaturaPage from "../app/treinador/assinatura/page";
import PagamentoPage from "../app/treinador/pagamento/page";
import { saveSession } from "@/lib/session";
import { renderWithQuery } from "./query-wrapper";
import * as billing from "@/repositories/billing";

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@mercadopago/sdk-react", () => ({
  initMercadoPago: vi.fn(),
  CardPayment: ({ locale }: { locale?: string }) => (
    <div data-testid="mp-card-form" data-locale={locale ?? "pt-BR"}>
      formulário Mercado Pago
    </div>
  ),
}));

beforeEach(() => {
  cleanup();
  localStorage.clear();
  push.mockReset();
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

test("confirmar plano em /treinador/assinatura chama o repositório e cai em /treinador/pagamento com o formulário", async () => {
  saveTrainerSession();

  const createOrder = vi.spyOn(billing, "createOrder").mockResolvedValue({
    id: "order-1",
    trainerId: "user-2",
    planCode: "MONTHLY",
    amountCents: 4990,
    status: "PENDING",
    createdAt: "2026-11-16T00:00:00.000Z",
  });

  vi.spyOn(billing, "listPlans").mockResolvedValue([
    { planCode: "MONTHLY", amountCents: 4990 },
    { planCode: "YEARLY", amountCents: 39900 },
  ]);

  const { unmount } = renderWithQuery(<AssinaturaPage />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /mensal/i })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole("button", { name: /mensal/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

  await waitFor(() => {
    expect(createOrder).toHaveBeenCalledWith({ planCode: "MONTHLY" });
    expect(push).toHaveBeenCalledWith("/treinador/pagamento");
  });

  unmount();
  push.mockReset();

  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });
  vi.spyOn(billing, "getCurrentOrder").mockResolvedValue({
    id: "order-1",
    trainerId: "user-2",
    planCode: "MONTHLY",
    amountCents: 4990,
    status: "PENDING",
    createdAt: "2026-11-16T00:00:00.000Z",
  });

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeTruthy();
  });
});

test("sair de /treinador/assinatura sem confirmar não chama POST de pedido", async () => {
  saveTrainerSession();

  const createOrder = vi.spyOn(billing, "createOrder").mockResolvedValue({
    id: "order-1",
    trainerId: "user-2",
    planCode: "MONTHLY",
    amountCents: 4990,
    status: "PENDING",
    createdAt: "2026-11-16T00:00:00.000Z",
  });

  vi.spyOn(billing, "listPlans").mockResolvedValue([
    { planCode: "MONTHLY", amountCents: 4990 },
    { planCode: "YEARLY", amountCents: 39900 },
  ]);

  renderWithQuery(<AssinaturaPage />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /mensal/i })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole("button", { name: /mensal/i }));
  fireEvent.click(screen.getByRole("link", { name: /voltar|painel/i }));

  expect(createOrder).not.toHaveBeenCalled();
});
