"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { Card } from "@/components/ui/card";

const PILARES = [
  {
    src: "/landing/pilar-teto.svg",
    alt: "Linha de teto calórico que sobe e desce com o andamento da dieta",
    width: 800,
    height: 600,
    title: "O teto muda sozinho",
    body: "Depois do setup, o teto varia com a perda ou o ganho conforme a dieta segue — sem o aluno redigitar o peso e sem o treinador autorizar cada dia.",
  },
  {
    src: "/landing/pilar-dia.svg",
    alt: "Dia nutricional encerrado, sem planilha",
    width: 800,
    height: 600,
    title: "O aluno vê se o dia fechou",
    body: "Pouco tempo na tela, sem planilha, para saber se o dia fechou.",
  },
  {
    src: "/landing/pilar-carteira.svg",
    alt: "Carteira de alunos no painel do treinador",
    width: 800,
    height: 600,
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
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <div className="zt-landing-media">
      {/* Slot até o webp gerado chegar; o SVG marca o tamanho. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} />
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

export function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="zt-page">
        <div className="zt-landing">
          <section className="zt-landing-hero">
            <div>
              <p className="zt-apoio">Treino híbrido</p>
              <h1 className="zt-titulo mt-token-sm">Zenith Tracker</h1>
              <p className="zt-subtitulo mt-token-sm">
                Acompanhamento nutricional do treino híbrido.
              </p>
              <p className="zt-corpo mt-token-md">
                Apps de kcal cravam o teto no cadastro: o número não acompanha a perda
                nem o ganho. Aqui o treinador monta o setup; depois o teto acompanha a
                dieta.
              </p>
            </div>
            <LandingImage
              src="/landing/hero.svg"
              alt="Aluno e treinador no acompanhamento nutricional do treino híbrido"
              width={1600}
              height={900}
            />
          </section>

          <section className="zt-landing-secao" aria-labelledby="problema-titulo">
            <h2 id="problema-titulo" className="zt-subtitulo">
              O que os apps de kcal não resolvem
            </h2>
            <div className="zt-landing-problema">
              <LandingImage
                src="/landing/problema.svg"
                alt="Teto cravado no cadastro de um lado, carteira no WhatsApp do outro"
                width={1200}
                height={800}
              />
              <div className="zt-landing-problema-textos">
                <Card>
                  <h3 className="zt-subtitulo">Teto cravado no cadastro</h3>
                  <p className="zt-corpo mt-token-sm">
                    Peso, altura, sexo e idade de um dia só. Ou o aluno fica redigitando
                    o peso atual, ou a dieta mente. Quem treina força, cardio e esporte
                    no mesmo ciclo ainda vê essa meta ignorar o dia real.
                  </p>
                </Card>
                <Card>
                  <h3 className="zt-subtitulo">Carteira no WhatsApp</h3>
                  <p className="zt-corpo mt-token-sm">
                    O treinador atende no WhatsApp pessoal, sem ver quem precisa de
                    atenção agora e sem um lugar onde a própria marca apareça.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          <section className="zt-landing-secao" aria-labelledby="jornada-titulo">
            <h2 id="jornada-titulo" className="zt-subtitulo">
              Como o produto conduz o dia
            </h2>
            <p className="zt-corpo mt-token-sm">
              O treinador autoriza o número só no setup. Depois o automático recomeça a
              cada gravação nova — uma edição de dieta ou treino vira um setup novo.
            </p>
            <div className="mt-token-lg">
              <LandingImage
                src="/landing/jornada.svg"
                alt="Quatro passos: setup, teto automático, dia fechado e carteira no painel"
                width={1400}
                height={560}
              />
            </div>
            <ol className="zt-landing-passos">
              {PASSOS.map((passo, index) => (
                <li key={passo.titulo}>
                  <p className="zt-apoio">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="zt-subtitulo mt-token-xs">{passo.titulo}</h3>
                  <p className="zt-apoio mt-token-sm">{passo.corpo}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="zt-landing-secao" aria-labelledby="pilares-titulo">
            <h2 id="pilares-titulo" className="zt-subtitulo">
              O que muda no dia a dia
            </h2>
            <div className="zt-landing-grid">
              {PILARES.map((pilar) => (
                <Reveal key={pilar.title}>
                  <Card>
                    <div className="zt-card-media">
                      <LandingImage
                        src={pilar.src}
                        alt={pilar.alt}
                        width={pilar.width}
                        height={pilar.height}
                      />
                    </div>
                    <h3 className="zt-subtitulo">{pilar.title}</h3>
                    <p className="zt-apoio mt-token-sm">{pilar.body}</p>
                    <Link href="/cadastro" className="zt-link-sutil">
                      Conheça agora
                    </Link>
                  </Card>
                </Reveal>
              ))}
            </div>
          </section>

          <section className="zt-landing-secao" aria-labelledby="criterio-titulo">
            <Card>
              <h2 id="criterio-titulo" className="zt-subtitulo">
                Como saberemos que deu certo
              </h2>
              <p className="zt-corpo mt-token-md">
                O aluno com plano vigente vê um teto que mudou sozinho com o andamento
                da dieta — não o mesmo número do setup, e sem o treinador ter autorizado
                aquele dia, e sem o aluno ter redigitado o peso. Ele consegue dizer se o
                dia fechou, sem planilha. O treinador com assinatura ativa conduz a
                carteira no produto e só entra de novo no número se decidir mudar dieta
                ou treino.
              </p>
            </Card>
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}
