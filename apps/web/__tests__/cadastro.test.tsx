import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import CadastroPage from "../app/cadastro/page";
import AlunoPage from "../app/aluno/page";
import TreinadorPage from "../app/treinador/page";
import { saveSession } from "@/lib/session";
import { renderWithQuery } from "./query-wrapper";

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
  fireEvent.click(screen.getByLabelText("Papel"));
  fireEvent.click(screen.getByRole("option", { name: values.roleLabel }));
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

  const { unmount } = renderWithQuery(<CadastroPage />);

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

  const { unmount } = renderWithQuery(<CadastroPage />);

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
  const { unmount } = renderWithQuery(<CadastroPage />);

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

  renderWithQuery(<CadastroPage />);

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

  renderWithQuery(<CadastroPage />);

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

  renderWithQuery(<CadastroPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/treinador");
  });
  expect(register).not.toHaveBeenCalled();
});

test("falha de conexão no cadastro não mostra que o e-mail já existe", async () => {
  register.mockRejectedValue(new Error("Failed to fetch"));

  renderWithQuery(<CadastroPage />);

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

test("confirmação diferente não chama o repositório e não cria sessão", async () => {
  renderWithQuery(<CadastroPage />);

  fillCadastroForm({
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "Senha123",
    confirmPassword: "Senha456",
    roleLabel: "Aluno",
  });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  expect(register).not.toHaveBeenCalled();
  expect(screen.getByText(/dados não passaram/i)).toBeDefined();
  expect(document.body.textContent).not.toMatch(/Senha123|Senha456/);
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(push).not.toHaveBeenCalled();
});

test.each([
  {
    title: "senha curta",
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "Abcdef1",
    confirmPassword: "Abcdef1",
  },
  {
    title: "senha sem letra",
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "12345678",
    confirmPassword: "12345678",
  },
  {
    title: "senha sem dígito",
    name: "Ana Aluna",
    email: "ana@example.com",
    password: "Abcdefgh",
    confirmPassword: "Abcdefgh",
  },
  {
    title: "nome vazio",
    name: "",
    email: "ana@example.com",
    password: "Senha123",
    confirmPassword: "Senha123",
  },
  {
    title: "e-mail sem formato",
    name: "Ana Aluna",
    email: "nao-e-email",
    password: "Senha123",
    confirmPassword: "Senha123",
  },
])(
  "recusa $title mostra que os dados não passaram, sem senha no texto",
  async ({ name, email, password, confirmPassword }) => {
    register.mockRejectedValue(new Error("Os dados não passaram"));

    renderWithQuery(<CadastroPage />);

    fillCadastroForm({
      name,
      email,
      password,
      confirmPassword,
      roleLabel: "Aluno",
    });

    fireEvent.submit(screen.getByRole("button", { name: "Confirmar" }).closest("form")!);

    await waitFor(() => {
      expect(register).toHaveBeenCalled();
      expect(screen.getByText(/dados não passaram/i)).toBeDefined();
    });

    expect(screen.queryByText(/e-mail já existe/i)).toBeNull();
    expect(document.body.textContent).not.toContain(password);
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  },
);
