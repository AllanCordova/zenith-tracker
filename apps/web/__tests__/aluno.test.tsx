import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
