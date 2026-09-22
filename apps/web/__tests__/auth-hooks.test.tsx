import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { useLogin } from "@/hooks/use-login";
import { useRegister } from "@/hooks/use-register";
import { createTestQueryClient } from "./query-wrapper";

const { login, register } = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("@/repositories/auth", () => ({
  login: (...args: unknown[]) => login(...args),
  register: (...args: unknown[]) => register(...args),
}));

const aluno = {
  accessToken: "jwt-aluno",
  user: {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT" as const,
  },
};

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  localStorage.clear();
  login.mockReset();
  register.mockReset();
});

test("useLogin grava a sessão quando o repositório devolve token", async () => {
  login.mockResolvedValue(aluno);

  const { result } = renderHook(() => useLogin(), { wrapper });

  await act(async () => {
    await result.current.mutateAsync({
      email: "ana@example.com",
      password: "Senha123",
    });
  });

  expect(login).toHaveBeenCalledWith({
    email: "ana@example.com",
    password: "Senha123",
  });
  expect(localStorage.getItem("accessToken")).toBe("jwt-aluno");
});

test("useLogin não grava sessão quando a combinação não confere", async () => {
  login.mockResolvedValue(undefined);

  const { result } = renderHook(() => useLogin(), { wrapper });

  await act(async () => {
    await result.current.mutateAsync({
      email: "ana@example.com",
      password: "SenhaErrada1",
    });
  });

  expect(localStorage.getItem("accessToken")).toBeNull();
});

test("useRegister grava a sessão quando o repositório devolve token", async () => {
  register.mockResolvedValue(aluno);

  const { result } = renderHook(() => useRegister(), { wrapper });

  await act(async () => {
    await result.current.mutateAsync({
      name: "Ana Aluna",
      email: "ana@example.com",
      password: "Senha123",
      role: "STUDENT",
    });
  });

  expect(register).toHaveBeenCalledWith({
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "Senha123",
    role: "STUDENT",
  });
  expect(localStorage.getItem("accessToken")).toBe("jwt-aluno");
});
