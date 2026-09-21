import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { login, register } from "../repositories/auth";

const registerPayload = {
  name: "Ana Aluna",
  email: "ana@example.com",
  password: "Senha123",
  role: "STUDENT" as const,
};

const loginPayload = {
  email: "ana@example.com",
  password: "Senha123",
};

const sessionEnvelope = {
  data: {
    accessToken: "jwt",
    user: {
      id: "user-1",
      name: "Ana Aluna",
      email: "ana@example.com",
      role: "STUDENT",
    },
  },
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      status: 201,
      json: async () => sessionEnvelope,
    }),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("register com NEXT_PUBLIC_API_URL vazio chama a API em :3000, não o Next", async () => {
  await register(registerPayload);

  const url = vi.mocked(fetch).mock.calls[0][0];
  expect(url).toBe("http://localhost:3000/auth/register");
  expect(String(url)).not.toContain(":3001");
});

test("login com NEXT_PUBLIC_API_URL vazio chama a API em :3000, não o Next", async () => {
  await login(loginPayload);

  const url = vi.mocked(fetch).mock.calls[0][0];
  expect(url).toBe("http://localhost:3000/auth/login");
  expect(String(url)).not.toContain(":3001");
});
