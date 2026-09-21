import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import TreinadorPage from "../app/treinador/page";
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

test("visitante sem JWT em /treinador cai em /login e não mostra nome nem carteira", async () => {
  render(<TreinadorPage />);

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

  render(<TreinadorPage />);

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

  const { unmount } = render(<TreinadorPage />);

  fireEvent.click(screen.getByRole("button", { name: "Sair" }));

  expect(localStorage.getItem("accessToken")).toBeNull();

  unmount();
  push.mockReset();
  render(<TreinadorPage />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
});
