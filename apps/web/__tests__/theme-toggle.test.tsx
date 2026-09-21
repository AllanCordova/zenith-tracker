import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { Header } from "@/components/layout/header";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const { setTheme, resolvedTheme } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  resolvedTheme: { current: "light" as string | undefined },
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: resolvedTheme.current,
    setTheme,
  }),
}));

beforeEach(() => {
  cleanup();
  setTheme.mockReset();
  resolvedTheme.current = "light";
});

test("no claro, o toggle pede o tema escuro", async () => {
  render(<ThemeToggle />);

  const botao = screen.getByRole("button", { name: "Ativar tema escuro" });
  await waitFor(() => {
    expect((botao as HTMLButtonElement).disabled).toBe(false);
  });

  fireEvent.click(botao);
  expect(setTheme).toHaveBeenCalledWith("dark");
});

test("no escuro, o toggle pede o tema claro", async () => {
  resolvedTheme.current = "dark";
  render(<ThemeToggle />);

  const botao = await screen.findByRole("button", { name: "Ativar tema claro" });
  await waitFor(() => {
    expect((botao as HTMLButtonElement).disabled).toBe(false);
  });

  fireEvent.click(botao);
  expect(setTheme).toHaveBeenCalledWith("light");
});

test("header mostra a marca e o toggle de tema", async () => {
  render(<Header />);

  expect(screen.getByRole("link", { name: "Zenith Tracker" })).toBeDefined();
  await waitFor(() => {
    expect(
      (screen.getByRole("button", { name: "Ativar tema escuro" }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });
});
