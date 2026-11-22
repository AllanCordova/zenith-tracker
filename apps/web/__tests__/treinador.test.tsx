import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import TreinadorPage from "../app/treinador/page";
import { saveSession } from "@/lib/session";
import { renderWithQuery } from "./query-wrapper";
import * as billing from "@/repositories/billing";

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
  vi.spyOn(billing, "getCurrentSubscription").mockResolvedValue(undefined);
});

function jwtExpirado(): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify({ sub: "user-2", exp: 1 })).toString(
    "base64url",
  );
  return `${header}.${payload}.sig`;
}

test("JWT expirado em /treinador é descartado e cai em /login", async () => {
  saveSession(jwtExpirado(), {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  renderWithQuery(<TreinadorPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(screen.queryByText("Téo Treinador")).toBeNull();
  expect(screen.queryByText("carteira ainda não libera")).toBeNull();
});

test("visitante sem JWT em /treinador cai em /login e não mostra nome nem carteira", async () => {
  renderWithQuery(<TreinadorPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
  expect(screen.queryByText("carteira ainda não libera")).toBeNull();
  expect(screen.queryByText("plano ainda não fechado")).toBeNull();
  expect(screen.queryByText(/Ana Aluna|Téo Treinador/)).toBeNull();
});

test("sessão de aluno em /treinador permanece em /aluno", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  renderWithQuery(<TreinadorPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/aluno");
  });
  expect(screen.queryByText("carteira ainda não libera")).toBeNull();
});

test("logout apaga o JWT e a área autenticada seguinte exige /login", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  const { unmount } = renderWithQuery(<TreinadorPage />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Sair" })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole("button", { name: "Sair" }));

  expect(localStorage.getItem("accessToken")).toBeNull();

  unmount();
  push.mockReset();
  renderWithQuery(<TreinadorPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
});

test("painel com Assinatura ACTIVE deixa de tratar como sem assinatura (CA2)", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  vi.spyOn(billing, "getCurrentSubscription").mockResolvedValue({
    id: "sub-1",
    trainerId: "user-2",
    orderId: "order-1",
    planCode: "YEARLY",
    status: "ACTIVE",
    activatedAt: "2026-11-22T00:00:00.000Z",
  });

  renderWithQuery(<TreinadorPage />);

  await waitFor(() => {
    expect(screen.getByText("Assinatura ativa")).toBeTruthy();
  });
  expect(screen.queryByText("carteira ainda não libera")).toBeNull();
  expect(screen.queryByRole("link", { name: /contratar assinatura/i })).toBeNull();
});
