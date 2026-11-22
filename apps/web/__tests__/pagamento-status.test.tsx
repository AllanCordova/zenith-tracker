import { cleanup, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import PagamentoStatusPage from "../app/treinador/pagamento/status/page";
import { http } from "@/lib/http";
import { saveSession } from "@/lib/session";
import * as billing from "@/repositories/billing";
import { renderWithQuery } from "./query-wrapper";

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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

const pendingOrder: billing.Order = {
  id: "order-pending-ca3",
  trainerId: "user-2",
  planCode: "MONTHLY",
  amountCents: 4990,
  status: "PENDING",
  createdAt: "2026-11-16T00:00:00.000Z",
};

test("com Pedido PENDING e sem webhook, status mostra Pendente e não libera carteira (CA3)", async () => {
  saveTrainerSession();

  const getCurrentOrder = vi
    .spyOn(billing, "getCurrentOrder")
    .mockResolvedValue(pendingOrder);
  const getCurrentSubscription = vi
    .spyOn(billing, "getCurrentSubscription")
    .mockResolvedValue(null);
  const chargeOrder = vi.spyOn(billing, "chargeOrder");
  const httpPost = vi.spyOn(http, "post");

  renderWithQuery(<PagamentoStatusPage />);

  await waitFor(() => {
    expect(screen.getByText("Pendente")).toBeTruthy();
  });

  expect(screen.getByRole("status").textContent).toMatch(
    /carteira ainda não libera/i,
  );
  expect(screen.queryByText("Assinatura ativa")).toBeNull();

  expect(getCurrentOrder).toHaveBeenCalled();
  expect(getCurrentSubscription).toHaveBeenCalled();
  expect(chargeOrder).not.toHaveBeenCalled();
  expect(httpPost).not.toHaveBeenCalled();
});
