import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

test("a landing descreve a visão do produto e aponta o cadastro nos cards", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "Zenith Tracker" })).toBeDefined();
  expect(screen.getByText(/cravam o teto no cadastro/i)).toBeDefined();
  expect(screen.getByText(/redigitando o peso/i)).toBeDefined();
  expect(screen.getAllByText(/dia fechou/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/WhatsApp/i).length).toBeGreaterThan(0);
  expect(screen.queryByRole("link", { name: "Cadastro" })).toBeNull();
  expect(screen.queryByRole("link", { name: "Entrar" })).toBeNull();

  const cta = screen.getAllByRole("link", { name: "Conheça agora" });
  expect(cta).toHaveLength(3);
  expect(cta.every((link) => link.getAttribute("href") === "/cadastro")).toBe(true);
});
