import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import LoginPage from "../app/login/page";
import AlunoPage from "../app/aluno/page";
import TreinadorPage from "../app/treinador/page";

const { push, login } = vi.hoisted(() => ({
  push: vi.fn(),
  login: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/repositories/auth", () => ({
  login: (...args: unknown[]) => login(...args),
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
});

test("login com combinação errada não grava JWT e mostra texto genérico", async () => {
  login.mockResolvedValue(undefined);

  render(<LoginPage />);

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

  const { unmount } = render(<LoginPage />);

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

  const { unmount } = render(<LoginPage />);

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
