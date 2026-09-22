import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { http } from "../lib/http";
import { saveSession } from "../lib/session";

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv("NEXT_PUBLIC_API_URL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  http.defaults.adapter = undefined;
});

test("sem NEXT_PUBLIC_API_URL o cliente aponta para a API em :3000, não o Next", async () => {
  let seenBaseURL: string | undefined;
  http.defaults.adapter = async (config) => {
    seenBaseURL = config.baseURL;
    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };

  await http.post("/auth/login", {});

  expect(seenBaseURL).toBe("http://localhost:3000");
  expect(seenBaseURL).not.toContain(":3001");
});

test("com sessão, o cliente manda Authorization Bearer", async () => {
  saveSession("jwt-token", {
    id: "user-1",
    name: "Ana Aluna",
    email: "ana@example.com",
    role: "STUDENT",
  });

  let authorization: unknown;
  http.defaults.adapter = async (config) => {
    authorization = config.headers.Authorization;
    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };

  await http.get("/me");

  expect(authorization).toBe("Bearer jwt-token");
});

test("sem sessão, o cliente não manda Authorization", async () => {
  let authorization: unknown = "presente";
  http.defaults.adapter = async (config) => {
    authorization = config.headers.Authorization;
    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };

  await http.get("/me");

  expect(authorization).toBeUndefined();
});
