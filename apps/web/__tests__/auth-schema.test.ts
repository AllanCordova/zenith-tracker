import { expect, test } from "vitest";
import { loginSchema, registerSchema } from "../lib/auth-schema";

const cadastroValido = {
  name: "Ana Aluna",
  email: "ana@example.com",
  password: "Senha123",
  confirmPassword: "Senha123",
  role: "STUDENT" as const,
};

test("schema de cadastro aceita o payload válido e não devolve a senha no erro", () => {
  const parsed = registerSchema.safeParse(cadastroValido);
  expect(parsed.success).toBe(true);
});

test.each([
  { title: "senha curta", patch: { password: "Abcdef1", confirmPassword: "Abcdef1" } },
  { title: "senha sem letra", patch: { password: "12345678", confirmPassword: "12345678" } },
  { title: "senha sem dígito", patch: { password: "Abcdefgh", confirmPassword: "Abcdefgh" } },
  { title: "nome vazio", patch: { name: "" } },
  { title: "e-mail sem formato", patch: { email: "nao-e-email" } },
  { title: "confirmação diferente", patch: { confirmPassword: "Senha456" } },
])("schema de cadastro recusa $title", ({ patch }) => {
  const parsed = registerSchema.safeParse({ ...cadastroValido, ...patch });
  expect(parsed.success).toBe(false);
  if (!parsed.success) {
    expect(JSON.stringify(parsed.error)).not.toMatch(/Senha123|Senha456|Abcdef1|Abcdefgh|12345678/);
  }
});

test("schema de login aceita e-mail e senha", () => {
  expect(
    loginSchema.safeParse({ email: "ana@example.com", password: "Senha123" }).success,
  ).toBe(true);
});

test("schema de login recusa e-mail sem formato", () => {
  expect(loginSchema.safeParse({ email: "nao-e-email", password: "Senha123" }).success).toBe(
    false,
  );
});
