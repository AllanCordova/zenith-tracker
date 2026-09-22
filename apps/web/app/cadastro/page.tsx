"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";
import { registerSchema, type RegisterFormValues } from "@/lib/auth-schema";
import Link from "next/link";
import { ProductShell } from "@/components/product-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSelect } from "@/components/ui/role-select";
import { useRegister } from "@/hooks/use-register";

const DADOS_NAO_PASSARAM = "Os dados não passaram";

export default function CadastroPage() {
  const router = useRouter();
  const registerAccount = useRegister();
  const token = getAccessToken();
  const sessionUser = getSessionUser();
  const sessionRole = sessionUser?.role;
  const [error, setError] = useState("");
  const { control, handleSubmit, register } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
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

  async function onValid(values: RegisterFormValues) {
    try {
      const result = await registerAccount.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
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
        <form noValidate onSubmit={handleSubmit(onValid, () => setError(DADOS_NAO_PASSARAM))}>
          <Input id="name" label="Nome" {...register("name")} />

          <Input id="email" label="E-mail" type="email" {...register("email")} />

          <Input id="password" label="Senha" type="password" {...register("password")} />

          <Input
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            {...register("confirmPassword")}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => <RoleSelect value={field.value} onChange={field.onChange} />}
          />

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
