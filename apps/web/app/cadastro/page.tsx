"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser, saveSession } from "@/lib/session";
import Link from "next/link";
import { ProductShell } from "@/components/product-shell";
import { register } from "@/repositories/auth";

const DADOS_NAO_PASSARAM = "Os dados não passaram";

export default function CadastroPage() {
  const router = useRouter();
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
      const result = await register({ name, email, password, role });
      if (!result?.accessToken || !result.user) {
        setError("Este e-mail já existe");
        return;
      }
      saveSession(result.accessToken, result.user);
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
          <label className="zt-label" htmlFor="name">
            Nome
          </label>
          <input
            className="zt-input"
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label className="zt-label" htmlFor="email">
            E-mail
          </label>
          <input
            className="zt-input"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className="zt-label" htmlFor="password">
            Senha
          </label>
          <input
            className="zt-input"
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <label className="zt-label" htmlFor="confirmPassword">
            Confirmar senha
          </label>
          <input
            className="zt-input"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <fieldset className="zt-fieldset">
            <legend className="zt-legend">Papel</legend>
            <div className="zt-papel">
              <span>
                <input
                  id="role-student"
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={role === "STUDENT"}
                  onChange={() => setRole("STUDENT")}
                />
                <label htmlFor="role-student">Aluno</label>
              </span>
              <span>
                <input
                  id="role-trainer"
                  type="radio"
                  name="role"
                  value="TRAINER"
                  checked={role === "TRAINER"}
                  onChange={() => setRole("TRAINER")}
                />
                <label htmlFor="role-trainer">Treinador</label>
              </span>
            </div>
          </fieldset>

          <button className="zt-btn" type="submit">
            Confirmar
          </button>
        </form>
        {error ? <p className="zt-erro">{error}</p> : null}
        <p className="zt-nav">
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </main>
    </ProductShell>
  );
}
