"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser, saveSession } from "@/lib/session";
import Link from "next/link";
import { ProductShell } from "@/components/product-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    try {
      const result = await login({ email, password });
      if (!result?.accessToken || !result.user) {
        setError("A combinação não confere");
        return;
      }
      saveSession(result.accessToken, result.user);
      router.push(areaPathForRole(result.user.role));
    } catch {
      setError("Não deu certo. Verifique a conexão.");
    }
  }

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Entrar</h1>
        <form onSubmit={onSubmit}>
          <Input
            id="email"
            name="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            id="password"
            name="password"
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit">Entrar</Button>
        </form>
        {error ? <p className="zt-erro">{error}</p> : null}
        <p className="zt-nav">
          Ainda não tem conta? <Link href="/cadastro">Cadastro</Link>
        </p>
      </main>
    </ProductShell>
  );
}
