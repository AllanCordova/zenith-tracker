import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

test("rodapé aponta para cadastro e login", () => {
  render(<Footer />);

  expect(screen.getByRole("link", { name: "Cadastro" }).getAttribute("href")).toBe(
    "/cadastro",
  );
  expect(screen.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
});
