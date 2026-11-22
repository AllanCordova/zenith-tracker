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

vi.mock("next/dynamic", () => ({
  default: () =>
    function MercadoPagoCardPaymentMock() {
      return (
        <div data-testid="mp-card-form" data-locale="pt-BR">
          formulário Mercado Pago
        </div>
      );
    },
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

test("UI mostra que a assinatura já está ativa ao tentar o mesmo planCode", async () => {
  saveTrainerSession();

  const createOrder = vi
    .spyOn(billing, "createOrder")
    .mockRejectedValue(new Error("Assinatura já está ativa neste plano"));

  vi.spyOn(billing, "listPlans").mockResolvedValue([
    { planCode: "MONTHLY", amountCents: 4990 },
    { planCode: "YEARLY", amountCents: 39900 },
  ]);

  renderWithQuery(<AssinaturaPage />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /mensal/i })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole("button", { name: /mensal/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

  await waitFor(() => {
    expect(createOrder).toHaveBeenCalledWith({ planCode: "MONTHLY" });
    expect(screen.getByText(/já está ativa/i)).toBeTruthy();
  });

  expect(push).not.toHaveBeenCalledWith("/treinador/pagamento");
});

test("com assinatura ativa, plano diferente confirma e vai a /treinador/pagamento", async () => {
  saveTrainerSession();

  const createOrder = vi.spyOn(billing, "createOrder").mockResolvedValue({
    id: "order-yearly",
    trainerId: "user-2",
    planCode: "YEARLY",
    amountCents: 39900,
    status: "PENDING",
    createdAt: "2026-11-16T00:00:00.000Z",
  });

  vi.spyOn(billing, "listPlans").mockResolvedValue([
    { planCode: "MONTHLY", amountCents: 4990 },
    { planCode: "YEARLY", amountCents: 39900 },
  ]);

  renderWithQuery(<AssinaturaPage />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /anual/i })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole("button", { name: /anual/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

  await waitFor(() => {
    expect(createOrder).toHaveBeenCalledWith({ planCode: "YEARLY" });
    expect(push).toHaveBeenCalledWith("/treinador/pagamento");
  });
});

test("sessão de aluno em /treinador/assinatura permanece em /aluno e não cria pedido", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  const createOrder = vi.spyOn(billing, "createOrder");

  renderWithQuery(<AssinaturaPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/aluno");
  });
  expect(screen.queryByRole("button", { name: /mensal|anual|confirmar/i })).toBeNull();
  expect(screen.queryByText(/escolha o plano/i)).toBeNull();
  expect(createOrder).not.toHaveBeenCalled();
});

test("sessão de aluno em /treinador/pagamento permanece em /aluno e não monta formulário", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  const getCheckoutConfig = vi.spyOn(billing, "getCheckoutConfig");
  const getCurrentOrder = vi.spyOn(billing, "getCurrentOrder");

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/aluno");
  });
  expect(screen.queryByTestId("mp-card-form")).toBeNull();
  expect(screen.queryByText(/pagamento/i)).toBeNull();
  expect(getCheckoutConfig).not.toHaveBeenCalled();
  expect(getCurrentOrder).not.toHaveBeenCalled();
});

test("após POST ok e falha na navegação, reabrir contratação lê current e vai ao formulário sem segundo POST", async () => {
  saveTrainerSession();

  const pendingOrder = {
    id: "order-pending-ca9",
    trainerId: "user-2",
    planCode: "MONTHLY" as const,
    amountCents: 4990,
    status: "PENDING" as const,
    createdAt: "2026-11-16T00:00:00.000Z",
  };

  const createOrder = vi.spyOn(billing, "createOrder").mockResolvedValue(pendingOrder);
  vi.spyOn(billing, "listPlans").mockResolvedValue([
    { planCode: "MONTHLY", amountCents: 4990 },
    { planCode: "YEARLY", amountCents: 39900 },
  ]);

  push.mockImplementationOnce(() => {
    throw new Error("Network Error");
  });

  const { unmount } = renderWithQuery(<AssinaturaPage />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /mensal/i })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole("button", { name: /mensal/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));

  await waitFor(() => {
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(createOrder).toHaveBeenCalledWith({ planCode: "MONTHLY" });
  });

  unmount();
  push.mockReset();
  createOrder.mockClear();

  const getCurrentOrder = vi
    .spyOn(billing, "getCurrentOrder")
    .mockResolvedValue(pendingOrder);
  vi.spyOn(billing, "listPlans").mockResolvedValue([
    { planCode: "MONTHLY", amountCents: 4990 },
    { planCode: "YEARLY", amountCents: 39900 },
  ]);
  vi.spyOn(billing, "getCheckoutConfig").mockResolvedValue({
    publicKey: "TEST-PUBLIC-KEY",
  });

  const remount = renderWithQuery(<AssinaturaPage />);

  await waitFor(() => {
    expect(getCurrentOrder).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/treinador/pagamento");
  });
  expect(createOrder).not.toHaveBeenCalled();

  remount.unmount();
  push.mockReset();

  renderWithQuery(<PagamentoPage />);

  await waitFor(() => {
    expect(screen.getByTestId("mp-card-form")).toBeTruthy();
  });
});
