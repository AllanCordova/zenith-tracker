"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schema";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-login";
import { toastSuccess } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const token = getAccessToken();
  const sessionUser = getSessionUser();
  const sessionRole = sessionUser?.role;
  const [error, setError] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormValues>({
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
    setError("");
    try {
      const result = await login.mutateAsync(values);
      if (!result?.accessToken || !result.user) {
        setError("A combinação não confere");
        return;
      }
      toastSuccess("Você entrou");
      router.push(areaPathForRole(result.user.role));
    } catch {
      setError("Não deu certo. Verifique a conexão.");
    }
  }

  return (
    <main className="relative flex flex-1 items-center px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-foreground/5 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-12">
        <aside className="hidden flex-col gap-6 lg:col-span-5 lg:flex">
          <p className="zt-kicker">Treino híbrido</p>
          <p className="text-4xl font-bold tracking-tight text-foreground">
            O teto acompanha a dieta.
          </p>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            Setup do treinador. Dia do aluno. Carteira no produto. A área abre no papel
            da conta.
          </p>
          <div className="rounded-lg bg-surface-muted p-6">
            <div className="flex items-center gap-2">
              <LockKeyhole aria-hidden className="size-5" />
              <p className="text-lg font-semibold text-foreground">Sessão por papel</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Aluno e treinador entram com o mesmo formulário. O painel que abre é o da
              conta, sem escolher o papel de novo.
            </p>
          </div>
        </aside>
        <div className="lg:col-span-7">
          <div className="mx-auto w-full max-w-xl rounded-lg bg-surface-muted p-6 md:p-10">
            <Link
              href="/"
              className="mb-6 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Voltar ao portal
            </Link>
            <p className="zt-kicker">Sessão</p>
            <h1 className="zt-titulo mt-2">Entrar</h1>
            <p className="zt-apoio mt-2">A área abre no papel da conta.</p>
            <form noValidate onSubmit={handleSubmit(onValid)}>
              <Input
                id="email"
                label="E-mail"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                id="password"
                label="Senha"
                type="password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Button type="submit">Entrar</Button>
            </form>
            <FormError>{error}</FormError>
            <p className="zt-nav">
              Ainda não tem conta? <Link href="/cadastro">Cadastro</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
