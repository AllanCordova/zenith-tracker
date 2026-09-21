import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

test("a landing descreve a visão do produto e aponta para cadastro e login", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "Zenith Tracker" })).toBeDefined();
  expect(screen.getByText(/cravam o teto no cadastro/i)).toBeDefined();
  expect(screen.getByText(/redigitar o peso/i)).toBeDefined();
  expect(screen.getAllByText(/dia fechou/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/WhatsApp/i)).toBeDefined();
  expect(screen.getByRole("link", { name: "Cadastro" }).getAttribute("href")).toBe(
    "/cadastro",
  );
  expect(screen.getByRole("link", { name: "Entrar" }).getAttribute("href")).toBe("/login");
});
