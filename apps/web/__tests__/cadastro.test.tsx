import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import CadastroPage from "../app/cadastro/page";
import AlunoPage from "../app/aluno/page";
import TreinadorPage from "../app/treinador/page";
import { saveSession } from "@/lib/session";

const { push, register } = vi.hoisted(() => ({
  push: vi.fn(),
  register: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/repositories/auth", () => ({
  register: (...args: unknown[]) => register(...args),
}));

function fillCadastroForm(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleLabel: "Aluno" | "Treinador";
}) {
  fireEvent.change(screen.getByLabelText("Nome"), {
    target: { value: values.name },
  });
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: values.email },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: values.password },
  });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), {
    target: { value: values.confirmPassword },
  });
  fireEvent.click(screen.getByLabelText(values.roleLabel));
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  push.mockReset();
  register.mockReset();
});

test("cadastro de aluno grava JWT, cai em /aluno e mostra nome e substituto", async () => {
  register.mockResolvedValue({
    accessToken: "jwt-aluno",
    user: {
      id: "user-1",
      name: "Ana Aluna",
      email: "ana@example.com",
      role: "STUDENT",
    },
  });

  const { unmount } = render(<CadastroPage />);

  fillCadastroForm({
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
    roleLabel: "Aluno",
  });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() => {
    expect(register).toHaveBeenCalledWith({
      name: "Ana Aluna",
      email: "ana@example.com",
      password: "Senha123",
      role: "STUDENT",
    });
    expect(localStorage.getItem("accessToken")).toBe("jwt-aluno");
    expect(push).toHaveBeenCalledWith("/aluno");
  });

  unmount();
  render(<AlunoPage />);

  expect(screen.getByText("Ana Aluna")).toBeDefined();
  expect(screen.getByText("plano ainda não fechado")).toBeDefined();
});

test("cadastro de treinador grava JWT, cai em /treinador e mostra nome e substituto", async () => {
  register.mockResolvedValue({
    accessToken: "jwt-treinador",
    user: {
      id: "user-2",
      name: "Téo Treinador",
      email: "teo@example.com",
      role: "TRAINER",
    },
  });

  const { unmount } = render(<CadastroPage />);

  fillCadastroForm({
    name: "Téo Treinador",
    email: "teo@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
    roleLabel: "Treinador",
  });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() => {
    expect(localStorage.getItem("accessToken")).toBe("jwt-treinador");
    expect(push).toHaveBeenCalledWith("/treinador");
  });

  unmount();
  render(<TreinadorPage />);

  expect(screen.getByText("Téo Treinador")).toBeDefined();
  expect(screen.getByText("carteira ainda não libera")).toBeDefined();
});

test("desmontar o formulário sem confirmar não chama o repositório", () => {
  const { unmount } = render(<CadastroPage />);

  fillCadastroForm({
    name: "Visitante",
    email: "visitante@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
    roleLabel: "Aluno",
  });

  unmount();

  expect(register).not.toHaveBeenCalled();
});

test("cadastro com e-mail já existente mostra a mensagem e não grava JWT", async () => {
  register.mockResolvedValue(undefined);

  render(<CadastroPage />);

  fillCadastroForm({
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
    roleLabel: "Aluno",
  });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() => {
    expect(screen.getByText(/e-mail já existe/i)).toBeDefined();
  });

  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(push).not.toHaveBeenCalled();
});

test("sessão de aluno em /cadastro cai em /aluno sem segundo register", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  render(<CadastroPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/aluno");
  });
  expect(register).not.toHaveBeenCalled();
});

test("sessão de treinador em /cadastro cai em /treinador sem segundo register", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  render(<CadastroPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/treinador");
  });
  expect(register).not.toHaveBeenCalled();
});

test("falha de conexão no cadastro não mostra que o e-mail já existe", async () => {
  register.mockRejectedValue(new Error("Failed to fetch"));

  render(<CadastroPage />);

  fillCadastroForm({
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
    roleLabel: "Aluno",
  });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  await waitFor(() => {
    expect(screen.getByText(/não deu certo/i)).toBeDefined();
  });

  expect(screen.queryByText(/e-mail já existe/i)).toBeNull();
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(push).not.toHaveBeenCalled();
});
