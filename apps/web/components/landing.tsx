"use client";

import { useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { CalendarCheck, Gauge, Users } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { Card } from "@/components/ui/card";

const PILARES = [
  {
    icon: Gauge,
    title: "O teto muda sozinho",
    body: "Depois do setup, o teto varia com a perda ou o ganho conforme a dieta segue — sem o aluno redigitar o peso e sem o treinador autorizar cada dia.",
  },
  {
    icon: CalendarCheck,
    title: "O aluno vê se o dia fechou",
    body: "Pouco tempo na tela, sem planilha, para saber se o dia fechou.",
  },
  {
    icon: Users,
    title: "A carteira mora no produto",
    body: "O treinador paga a assinatura e conduz o vínculo e o setup no painel — não no WhatsApp pessoal.",
  },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function PillarMotion({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  children: ReactNode;
}) {
  const mounted = useIsClient();

  const card = (
    <Card>
      {mounted ? (
        <motion.span
          className="inline-flex"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon aria-hidden className="size-token-lg text-primaria" />
        </motion.span>
      ) : (
        <span className="inline-flex size-token-lg" aria-hidden />
      )}
      {children}
    </Card>
  );

  if (!mounted) {
    return card;
  }

  return (
    <motion.div initial={false} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      {card}
    </motion.div>
  );
}

export function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="zt-page">
        <div className="zt-landing">
          <header>
            <h1 className="zt-titulo">Zenith Tracker</h1>
            <p className="zt-subtitulo mt-token-sm">
              Acompanhamento nutricional do treino híbrido.
            </p>
            <p className="zt-corpo mt-token-md">
              Apps de kcal cravam o teto no cadastro: o número não acompanha a perda
              nem o ganho. Aqui o treinador monta o setup; depois o teto acompanha a
              dieta.
            </p>
          </header>

          <div className="zt-landing-grid">
            {PILARES.map((pilar) => (
              <PillarMotion key={pilar.title} icon={pilar.icon}>
                <h2 className="zt-subtitulo mt-token-sm">{pilar.title}</h2>
                <p className="zt-apoio mt-token-sm">{pilar.body}</p>
              </PillarMotion>
            ))}
          </div>

          <div className="zt-landing-cta">
            <Link href="/cadastro" className="zt-btn mt-0 inline-block text-center">
              Cadastro
            </Link>
            <Link href="/login" className="zt-btn mt-0 inline-block text-center">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
