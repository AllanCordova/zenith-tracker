import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
