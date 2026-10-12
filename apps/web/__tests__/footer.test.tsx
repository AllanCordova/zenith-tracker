import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { Footer } from "@/components/layout/footer";
import { saveSession } from "@/lib/session";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

beforeEach(() => {
  cleanup();
  localStorage.clear();
});

test("rodapé aponta para cadastro e login quando é visitante", () => {
  render(<Footer />);

  expect(screen.getByRole("contentinfo")).toBeDefined();
  expect(screen.getByRole("link", { name: "Cadastro" }).getAttribute("href")).toBe(
    "/cadastro",
  );
  expect(screen.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
});

test("rodapé logado não mostra cadastro nem login", async () => {
  saveSession("jwt-aluno", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  render(<Footer />);

  await waitFor(() => {
    expect(screen.queryByRole("link", { name: "Entrar" })).toBeNull();
  });
  expect(screen.queryByRole("link", { name: "Cadastro" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Sair" })).toBeNull();
});

test("rodapé não reusa as classes do header", () => {
  const source = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), "../components/layout/footer.tsx"),
    "utf8",
  );
  expect(source).not.toMatch(/zt-header/);
});
