import { AxiosHeaders } from "axios";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { http } from "../lib/http";
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

function axiosOk(status: number, data: unknown) {
  return {
    status,
    data,
    statusText: "OK",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

beforeEach(() => {
  vi.spyOn(http, "post").mockResolvedValue(axiosOk(201, sessionEnvelope));
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("register chama POST /auth/register no cliente axios, não o fetch", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");

  await register(registerPayload);

  expect(http.post).toHaveBeenCalledWith("/auth/register", registerPayload);
  expect(fetchSpy).not.toHaveBeenCalled();
});

test("login chama POST /auth/login no cliente axios, não o fetch", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");

  await login(loginPayload);

  expect(http.post).toHaveBeenCalledWith("/auth/login", loginPayload);
  expect(fetchSpy).not.toHaveBeenCalled();
});

test("register com 400 recusa os dados sem vazar o envelope", async () => {
  vi.mocked(http.post).mockResolvedValue(
    axiosOk(400, { statusCode: 400, message: "name should not be empty", error: "Bad Request" }),
  );

  await expect(register(registerPayload)).rejects.toThrow("Os dados não passaram");
});

test("login com 401 devolve vazio, sem detalhe de senha", async () => {
  vi.mocked(http.post).mockResolvedValue(
    axiosOk(401, { statusCode: 401, message: "A combinação não confere", error: "Unauthorized" }),
  );

  const result = await login(loginPayload);

  expect(result).toBeUndefined();
});

test("login com 403 devolve vazio, sem detalhe do recurso", async () => {
  vi.mocked(http.post).mockResolvedValue(
    axiosOk(403, { statusCode: 403, message: "Forbidden", error: "Forbidden" }),
  );

  const result = await login(loginPayload);

  expect(result).toBeUndefined();
});
