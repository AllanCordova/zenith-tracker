"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, GraduationCap } from "lucide-react";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";
import { registerSchema, type RegisterFormValues } from "@/lib/auth-schema";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { RoleSelect } from "@/components/ui/role-select";
import { useRegister } from "@/hooks/use-register";
import { toastSuccess } from "@/lib/toast";

const DADOS_NAO_PASSARAM = "Os dados não passaram";

const PERKS = {
  STUDENT: {
    kicker: "Papel aluno",
    items: [
      {
        title: "Teto sem redigitar o peso",
        body: "O número acompanha a perda ou o ganho conforme a dieta segue.",
      },
      {
        title: "Saber se o dia fechou",
        body: "Pouco tempo na tela, sem planilha.",
      },
    ],
  },
  TRAINER: {
    kicker: "Papel treinador",
    items: [
      {
        title: "Setup com revisão",
        body: "Antropometria, rotina, objetivo e margem antes de existir teto vigente.",
      },
      {
        title: "Carteira no produto",
        body: "O vínculo fica no painel, não no WhatsApp pessoal.",
      },
    ],
  },
} as const;

export default function CadastroPage() {
  const router = useRouter();
  const registerAccount = useRegister();
  const token = getAccessToken();
  const sessionUser = getSessionUser();
  const sessionRole = sessionUser?.role;
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    register,
    setError: setFieldError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    },
  });
  const role = useWatch({ control, name: "role" });
  const perks = PERKS[role];

  useEffect(() => {
    if (token && sessionRole) {
      router.push(areaPathForRole(sessionRole));
    }
  }, [token, sessionRole, router]);

  if (token && sessionRole) {
    return null;
  }

  async function onValid(values: RegisterFormValues) {
    setError("");
    try {
      const result = await registerAccount.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      if (!result?.accessToken || !result.user) {
        setFieldError("email", { type: "server", message: "Este e-mail já existe" });
        return;
      }
      toastSuccess("Conta criada");
      router.push(areaPathForRole(result.user.role));
    } catch (caught) {
      if (caught instanceof Error && caught.message === DADOS_NAO_PASSARAM) {
        setError(DADOS_NAO_PASSARAM);
        return;
      }
      setError("Não deu certo. Verifique a conexão.");
    }
  }

  return (
    <main className="relative flex-1 px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-8 lg:grid-cols-12">
        <aside className="flex flex-col gap-4 lg:col-span-5">
          <div className="rounded-lg bg-surface-muted p-6">
            <p className="zt-kicker">{perks.kicker}</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
              Nutrição do treino híbrido, no papel certo.
            </p>
            <p className="mt-3 text-base text-muted-foreground">
              O papel escolhido aqui não muda sozinho depois.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {perks.items.map((item) => (
                <li key={item.title} className="flex items-start gap-3 rounded-lg bg-background p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-foreground">
                    {role === "TRAINER" ? (
                      <Dumbbell aria-hidden className="size-4" />
                    ) : (
                      <GraduationCap aria-hidden className="size-4" />
                    )}
                  </span>
                  <span>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <section className="lg:col-span-7">
          <div className="rounded-lg bg-surface-muted p-6 md:p-8">
            <div className="mb-6 flex items-center justify-end gap-3">
              <span className="hidden text-sm text-muted-foreground md:inline">
                Já tem uma conta?
              </span>
              <Link
                href="/login"
                className="rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface"
              >
                Entrar
              </Link>
            </div>
            <p className="zt-kicker">Conta</p>
            <h1 className="zt-titulo mt-2">Cadastro</h1>
            <p className="zt-apoio mt-2">O papel escolhido aqui não muda sozinho depois.</p>
            <form noValidate onSubmit={handleSubmit(onValid)}>
              <Input id="name" label="Nome" error={errors.name?.message} {...register("name")} />
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
              <Input
                id="confirmPassword"
                label="Confirmar senha"
                type="password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <RoleSelect value={field.value} onChange={field.onChange} />
                )}
              />
              <Button type="submit">Confirmar</Button>
            </form>
            <FormError>{error}</FormError>
          </div>
        </section>
      </div>
    </main>
  );
}
