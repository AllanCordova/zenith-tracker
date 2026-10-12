"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, Dumbbell, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";

const PILARES = [
  {
    src: "/landing/pilar-teto.jpeg",
    alt: "Prato com arroz, feijão e frango ao lado de uma balança e uma curva do teto",
    width: 2400,
    height: 1792,
    title: "O teto muda sozinho",
    body: "Depois do setup, o teto varia com a perda ou o ganho conforme a dieta segue — sem o aluno redigitar o peso e sem o treinador autorizar cada dia.",
  },
  {
    src: "/landing/pilar-dia.jpeg",
    alt: "Aluna fecha o caderno depois da refeição, sem planilha",
    width: 2400,
    height: 1792,
    title: "O aluno vê se o dia fechou",
    body: "Pouco tempo na tela, sem planilha, para saber se o dia fechou.",
  },
  {
    src: "/landing/pilar-carteira.jpeg",
    alt: "Treinadora conduz um grupo de alunos no estúdio, sem celular na mão",
    width: 2400,
    height: 1792,
    title: "A carteira mora no produto",
    body: "O treinador paga a assinatura e conduz o vínculo e o setup no painel — não no WhatsApp pessoal.",
  },
];

const PASSOS = [
  {
    titulo: "O treinador monta o setup",
    corpo: "Antropometria, rotina, objetivo, revisão e margem. Sem essa revisão, não há teto vigente.",
  },
  {
    titulo: "O teto não espera de novo",
    corpo: "Varia com a perda ou o ganho conforme a dieta segue, sem o aluno definir o peso atual.",
  },
  {
    titulo: "O aluno consulta o dia",
    corpo: "Gasta pouco tempo para saber se o dia fechou — sem planilha e sem pânico de fim de semana.",
  },
  {
    titulo: "A carteira fica no painel",
    corpo: "Com a assinatura ativa, o treinador conduz vínculo, setup e quem está na consultoria no produto.",
  },
];

const FATOS = [
  { valor: "Setup", apoio: "O treinador autoriza o número uma vez" },
  { valor: "Teto", apoio: "Acompanha a perda ou o ganho" },
  { valor: "Dia", apoio: "O aluno vê se o dia fechou" },
  { valor: "Carteira", apoio: "O vínculo fica fora do WhatsApp" },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function LandingImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div className={className ?? "overflow-hidden rounded-lg bg-surface-muted"}>
      {/* Foto gerada no slot. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} className="block h-full w-full object-cover" />
    </div>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const mounted = useIsClient();
  if (!mounted) {
    return <div>{children}</div>;
  }
  return (
    <motion.div initial={false} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  );
}

function Cta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
    >
      {children}
    </Link>
  );
}

export function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div>
        <section id="produto" className="relative overflow-hidden px-4 py-16 md:px-8 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--foreground),transparent_55%)] opacity-[0.05]" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
            <p className="zt-kicker">Treino híbrido</p>
            <h1 className="zt-display mt-4 max-w-4xl">Zenith Tracker</h1>
            <p className="mt-4 max-w-2xl text-xl text-foreground">
              Acompanhamento nutricional do treino híbrido.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Apps de kcal cravam o teto no cadastro: o número não acompanha a perda
              nem o ganho. Aqui o treinador monta o setup; depois o teto acompanha a
              dieta.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Cta href="/cadastro">
                Começar agora
                <ArrowRight aria-hidden className="size-4" />
              </Cta>
              <a
                href="#funcionalidades"
                className="inline-flex items-center gap-2 rounded-lg bg-surface-muted px-6 py-3 text-sm font-semibold text-foreground hover:bg-border"
              >
                Ver o dia a dia
              </a>
            </div>
            <div className="relative mt-16 w-full max-w-5xl rounded-lg bg-surface-muted p-2">
              <LandingImage
                src="/landing/hero.jpeg"
                alt="Treinadora e aluno conversam na academia, com caderno e garrafa no banco"
                width={2752}
                height={1536}
                className="aspect-video overflow-hidden rounded-lg bg-surface"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface-muted px-4 py-10 md:px-8">
          <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center md:grid-cols-4">
            {FATOS.map((fato) => (
              <li key={fato.valor} className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-foreground">{fato.valor}</span>
                <span className="text-sm text-muted-foreground">{fato.apoio}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="arquitetura" className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-10">
            <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center">
              <p className="zt-kicker">Dois papéis</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                O treinador conduz o número. O aluno vê o dia.
              </h2>
              <p className="text-base text-muted-foreground">
                O setup fica com quem monta a dieta. Quem executa só precisa saber se o
                dia fechou.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article id="treinadores" className="flex flex-col rounded-lg bg-surface-muted p-6">
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-surface p-4">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-background text-foreground">
                    <Dumbbell aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Área do treinador</h3>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Setup e carteira
                    </p>
                  </div>
                </div>
                <ul className="flex flex-1 flex-col gap-3">
                  <li className="rounded-lg bg-background p-4">
                    <h4 className="text-sm font-semibold text-foreground">Setup com revisão</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Antropometria, rotina, objetivo e margem. Sem essa revisão, não há
                      teto vigente.
                    </p>
                  </li>
                  <li className="rounded-lg bg-background p-4">
                    <h4 className="text-sm font-semibold text-foreground">Carteira no painel</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O treinador atende no WhatsApp pessoal hoje. Aqui o vínculo e quem
                      está na consultoria ficam no produto.
                    </p>
                  </li>
                </ul>
              </article>
              <article id="alunos" className="flex flex-col rounded-lg bg-surface-muted p-6">
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-surface p-4">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-background text-foreground">
                    <GraduationCap aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Área do aluno</h3>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      Dia sem planilha
                    </p>
                  </div>
                </div>
                <ul className="flex flex-1 flex-col gap-3">
                  <li className="rounded-lg bg-background p-4">
                    <h4 className="text-sm font-semibold text-foreground">Teto do dia</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O aluno não redigita o peso. O teto varia com a perda ou o ganho
                      conforme a dieta segue.
                    </p>
                  </li>
                  <li className="rounded-lg bg-background p-4">
                    <h4 className="text-sm font-semibold text-foreground">O dia fechou</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pouco tempo na tela para saber se o dia fechou, sem planilha e sem
                      pânico de fim de semana.
                    </p>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="bg-surface-muted px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-10">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
              <p className="zt-kicker">Como o produto conduz o dia</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                O que os apps de kcal não resolvem
              </h2>
              <p className="text-base text-muted-foreground">
                Peso, altura, sexo e idade de um dia só. Ou o aluno fica redigitando o
                peso atual, ou a dieta mente. Quem treina força, cardio e esporte no
                mesmo ciclo ainda vê essa meta ignorar o dia real.
              </p>
            </div>
            <LandingImage
              src="/landing/problema.jpeg"
              alt="De um lado o aluno parado diante de um número que não muda; do outro, a treinadora sobrecarregada de papéis"
              width={2528}
              height={1696}
              className="mx-auto aspect-[3/2] max-w-3xl overflow-hidden rounded-lg bg-surface"
            />
            <div className="grid gap-6 md:grid-cols-3">
              {PILARES.map((pilar) => (
                <Reveal key={pilar.title}>
                  <Card>
                    <LandingImage
                      src={pilar.src}
                      alt={pilar.alt}
                      width={pilar.width}
                      height={pilar.height}
                      className="mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-surface-muted"
                    />
                    <h3 className="text-xl font-semibold text-foreground">{pilar.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{pilar.body}</p>
                    <Link
                      href="/cadastro"
                      className="mt-4 inline-flex text-sm font-semibold text-foreground"
                    >
                      Conheça agora
                    </Link>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Quatro momentos
            </h2>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              O treinador autoriza o número só no setup. Depois o automático recomeça a
              cada gravação nova — uma edição de dieta ou treino vira um setup novo.
            </p>
            <LandingImage
              src="/landing/jornada.jpeg"
              alt="Quatro momentos: setup, teto que varia, refeição do aluno e carteira no chão da academia"
              width={3168}
              height={1344}
              className="mt-8 aspect-[3168/1344] overflow-hidden rounded-lg bg-surface-muted"
            />
            <ol className="mt-10 grid list-none gap-10 p-0 md:grid-cols-2">
              {PASSOS.map((passo, index) => (
                <li key={passo.titulo}>
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{passo.titulo}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{passo.corpo}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 pb-16 md:px-8 md:pb-24">
          <Card>
            <h2 className="text-xl font-semibold text-foreground">Como saberemos que deu certo</h2>
            <p className="mt-4 text-base text-foreground">
              O aluno com plano vigente vê um teto que mudou sozinho com o andamento da
              dieta — não o mesmo número do setup, e sem o treinador ter autorizado
              aquele dia, e sem o aluno ter redigitado o peso. Ele consegue dizer se o
              dia fechou, sem planilha. O treinador com assinatura ativa conduz a
              carteira no produto e só entra de novo no número se decidir mudar dieta ou
              treino.
            </p>
          </Card>
        </section>
      </div>
    </MotionConfig>
  );
}
