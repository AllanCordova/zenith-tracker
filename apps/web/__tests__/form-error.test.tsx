import { cleanup, render, screen } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";
import { FormError } from "@/components/ui/form-error";

beforeEach(() => {
  cleanup();
});

test("FormError vazio não aparece", () => {
  const { container } = render(<FormError />);
  expect(container.textContent).toBe("");
  expect(screen.queryByRole("alert")).toBeNull();
});

test("FormError mostra a mensagem como alerta", () => {
  render(<FormError>só conta de aluno entra na carteira</FormError>);
  expect(screen.getByRole("alert").textContent).toBe(
    "só conta de aluno entra na carteira",
  );
});
