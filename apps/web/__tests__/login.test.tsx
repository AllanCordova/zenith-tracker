import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import LoginPage from "../app/login/page";
import AlunoPage from "../app/aluno/page";
import TreinadorPage from "../app/treinador/page";
import { saveSession } from "@/lib/session";
import { renderWithQuery } from "./query-wrapper";

const { push, login, register } = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/repositories/auth", () => ({
  login: (...args: unknown[]) => login(...args),
  register: (...args: unknown[]) => register(...args),
}));

function fillLoginForm(values: { email: string; password: string }) {
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: values.email },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: values.password },
  });
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  push.mockReset();
  login.mockReset();
  register.mockReset();
});

test("fetch rejeitado no login mostra falha, não grava JWT e não navega à área", async () => {
  login.mockRejectedValue(new TypeError("Failed to fetch"));

  renderWithQuery(<LoginPage />);

  fillLoginForm({
    email: "ana@example.com",
    password: "Senha123",
  });

  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

  await waitFor(() => {
    expect(screen.getByText(/não deu certo/i)).toBeDefined();
  });

  expect(screen.queryByText(/combinação não confere/i)).toBeNull();
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(push).not.toHaveBeenCalled();
});

test("login com combinação errada não grava JWT e mostra texto genérico", async () => {
  login.mockResolvedValue(undefined);

  renderWithQuery(<LoginPage />);

  fillLoginForm({
    email: "ana@example.com",
    password: "SenhaErrada1",
  });

  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

  await waitFor(() => {
    expect(screen.getByText(/combinação não confere/i)).toBeDefined();
  });

  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(push).not.toHaveBeenCalled();
});

test("sessão de aluno em /login cai em /aluno sem segundo register", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  renderWithQuery(<LoginPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/aluno");
  });
  expect(register).not.toHaveBeenCalled();
  expect(login).not.toHaveBeenCalled();
});

test("sessão de treinador em /login cai em /treinador sem segundo register", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  renderWithQuery(<LoginPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/treinador");
  });
  expect(register).not.toHaveBeenCalled();
  expect(login).not.toHaveBeenCalled();
});

test("login de aluno grava JWT e cai em /aluno", async () => {
  login.mockResolvedValue({
    accessToken: "jwt-aluno",
    user: {
      id: "user-1",
      name: "Ana Aluna",
      email: "ana@example.com",
      role: "STUDENT",
    },
  });

  const { unmount } = renderWithQuery(<LoginPage />);

  fillLoginForm({
    email: "ana@example.com",
    password: "Senha123",
  });

  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

  await waitFor(() => {
    expect(login).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "Senha123",
    });
    expect(localStorage.getItem("accessToken")).toBe("jwt-aluno");
    expect(push).toHaveBeenCalledWith("/aluno");
  });

  unmount();
  render(<AlunoPage />);

  expect(screen.getByText("Ana Aluna")).toBeDefined();
});

test("login de treinador grava JWT e cai em /treinador", async () => {
  login.mockResolvedValue({
    accessToken: "jwt-treinador",
    user: {
      id: "user-2",
      name: "Téo Treinador",
      email: "teo@example.com",
      role: "TRAINER",
    },
  });

  const { unmount } = renderWithQuery(<LoginPage />);

  fillLoginForm({
    email: "teo@example.com",
    password: "Senha123",
  });

  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

  await waitFor(() => {
    expect(localStorage.getItem("accessToken")).toBe("jwt-treinador");
    expect(push).toHaveBeenCalledWith("/treinador");
  });

  unmount();
  render(<TreinadorPage />);

  expect(screen.getByText("Téo Treinador")).toBeDefined();
});
