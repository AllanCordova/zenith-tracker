"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";
import Link from "next/link";
import { ProductShell } from "@/components/product-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSelect } from "@/components/ui/role-select";
import { useRegister } from "@/hooks/use-register";

const DADOS_NAO_PASSARAM = "Os dados não passaram";

export default function CadastroPage() {
  const router = useRouter();
  const register = useRegister();
  const token = getAccessToken();
  const sessionUser = getSessionUser();
  const sessionRole = sessionUser?.role;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TRAINER">("STUDENT");
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
    if (password !== confirmPassword) {
      setError(DADOS_NAO_PASSARAM);
      return;
    }
    try {
      const result = await register.mutateAsync({ name, email, password, role });
      if (!result?.accessToken || !result.user) {
        setError("Este e-mail já existe");
        return;
      }
      router.push(areaPathForRole(result.user.role));
    } catch (error) {
      if (error instanceof Error && error.message === DADOS_NAO_PASSARAM) {
        setError(DADOS_NAO_PASSARAM);
        return;
      }
      setError("Não deu certo. Verifique a conexão.");
    }
  }

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Cadastro</h1>
        <form onSubmit={onSubmit}>
          <Input
            id="name"
            name="name"
            label="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

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

          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <RoleSelect value={role} onChange={setRole} />

          <Button type="submit">Confirmar</Button>
        </form>
        {error ? <p className="zt-erro">{error}</p> : null}
        <p className="zt-nav">
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </main>
    </ProductShell>
  );
}
