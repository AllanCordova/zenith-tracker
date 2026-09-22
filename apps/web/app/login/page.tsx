"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schema";
import Link from "next/link";
import { ProductShell } from "@/components/product-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-login";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const token = getAccessToken();
  const sessionUser = getSessionUser();
  const sessionRole = sessionUser?.role;
  const [error, setError] = useState("");
  const { handleSubmit, register } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (token && sessionRole) {
      router.push(areaPathForRole(sessionRole));
    }
  }, [token, sessionRole, router]);

  if (token && sessionRole) {
    return null;
  }

  async function onValid(values: LoginFormValues) {
    try {
      const result = await login.mutateAsync(values);
      if (!result?.accessToken || !result.user) {
        setError("A combinação não confere");
        return;
      }
      router.push(areaPathForRole(result.user.role));
    } catch {
      setError("Não deu certo. Verifique a conexão.");
    }
  }

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Entrar</h1>
        <form
          noValidate
          onSubmit={handleSubmit(onValid, () => setError("A combinação não confere"))}
        >
          <Input id="email" label="E-mail" type="email" {...register("email")} />

          <Input id="password" label="Senha" type="password" {...register("password")} />

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
