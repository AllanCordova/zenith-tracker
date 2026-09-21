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
