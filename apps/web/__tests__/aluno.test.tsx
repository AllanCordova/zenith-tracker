import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import AlunoPage from "../app/aluno/page";
import { saveSession } from "@/lib/session";

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
});

function jwtExpirado(): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify({ sub: "user-1", exp: 1 })).toString(
    "base64url",
  );
  return `${header}.${payload}.sig`;
}

test("JWT expirado em /aluno é descartado e cai em /login", async () => {
  saveSession(jwtExpirado(), {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  render(<AlunoPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(screen.queryByText("Ana Aluna")).toBeNull();
  expect(screen.queryByText("plano ainda não fechado")).toBeNull();
});

test("visitante sem JWT em /aluno cai em /login e não mostra nome nem plano", async () => {
  render(<AlunoPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
  expect(screen.queryByText("plano ainda não fechado")).toBeNull();
  expect(screen.queryByText("carteira ainda não libera")).toBeNull();
  expect(screen.queryByText(/Ana Aluna|Téo Treinador/)).toBeNull();
});

test("sessão de treinador em /aluno permanece em /treinador", async () => {
  saveSession("jwt-treinador", {
    id: "user-2",
    name: "Téo Treinador",
    email: "teo@example.com",
    role: "TRAINER",
  });

  render(<AlunoPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/treinador");
  });
  expect(screen.queryByText("plano ainda não fechado")).toBeNull();
});

test("logout apaga o JWT e a área autenticada seguinte exige /login", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  const { unmount } = render(<AlunoPage />);

  fireEvent.click(screen.getByRole("button", { name: "Sair" }));

  expect(localStorage.getItem("accessToken")).toBeNull();

  unmount();
  push.mockReset();
  render(<AlunoPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
});
