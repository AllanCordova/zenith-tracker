"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser, saveSession } from "@/lib/session";
import { login } from "@/repositories/auth";

export default function LoginPage() {
  const router = useRouter();
  const token = getAccessToken();
  const sessionUser = getSessionUser();
  const sessionRole = sessionUser?.role;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && sessionRole) {
      router.push(areaPathForRole(sessionRole));
    }
  }, [token, sessionRole, router]);

  if (token && sessionRole) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await login({ email, password });
    if (!result?.accessToken || !result.user) {
      setError("A combinação não confere");
      return;
    }
    saveSession(result.accessToken, result.user);
    router.push(areaPathForRole(result.user.role));
  }

  return (
    <main>
      <h1>Entrar</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>
      {error ? <p>{error}</p> : null}
    </main>
  );
}
