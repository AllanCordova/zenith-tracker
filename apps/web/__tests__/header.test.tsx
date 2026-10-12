import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { Header } from "@/components/layout/header";
import { saveSession } from "@/lib/session";

const { push, toastSuccess } = vi.hoisted(() => ({
  push: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));

vi.mock("@/lib/toast", () => ({
  toastSuccess: (...args: unknown[]) => toastSuccess(...args),
}));

beforeEach(() => {
  cleanup();
  localStorage.clear();
  push.mockReset();
  toastSuccess.mockReset();
});

test("visitante vê o entrar de uma pessoa e não vê sair", () => {
  render(<Header />);

  expect(screen.getByRole("link", { name: "Zenith Tracker" })).toBeDefined();
  expect(screen.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
  expect(screen.queryByRole("button", { name: "Sair" })).toBeNull();
});

test("sessão autenticada troca o ícone de entrar por sair só no header", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  render(<Header />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Sair" })).toBeDefined();
  });
  expect(screen.queryByRole("link", { name: "Entrar" })).toBeNull();
});

test("sair no header apaga a sessão, toasta e cai em /login", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  render(<Header />);

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Sair" })).toBeDefined();
  });

  fireEvent.click(screen.getByRole("button", { name: "Sair" }));

  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(toastSuccess).toHaveBeenCalledWith("Você saiu");
  expect(push).toHaveBeenCalledWith("/login");
});
