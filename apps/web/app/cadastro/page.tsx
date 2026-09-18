"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/session";
import { register } from "@/repositories/auth";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TRAINER">("STUDENT");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await register({ name, email, password, role });
    saveSession(result.accessToken, result.user);
    router.push(role === "STUDENT" ? "/aluno" : "/treinador");
  }

  return (
    <main>
      <h1>Cadastro</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

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

        <label htmlFor="confirmPassword">Confirmar senha</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <fieldset>
          <legend>Papel</legend>
          <input
            id="role-student"
            type="radio"
            name="role"
            value="STUDENT"
            checked={role === "STUDENT"}
            onChange={() => setRole("STUDENT")}
          />
          <label htmlFor="role-student">Aluno</label>
          <input
            id="role-trainer"
            type="radio"
            name="role"
            value="TRAINER"
            checked={role === "TRAINER"}
            onChange={() => setRole("TRAINER")}
          />
          <label htmlFor="role-trainer">Treinador</label>
        </fieldset>

        <button type="submit">Confirmar</button>
      </form>
    </main>
  );
}
