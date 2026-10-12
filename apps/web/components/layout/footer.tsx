"use client";

import Link from "next/link";
import { useHasSession } from "@/hooks/use-has-session";

export function Footer() {
  const loggedIn = useHasSession();

  return (
    <footer className="zt-footer">
      <div className="zt-footer-inner">
        <p className="zt-footer-marca">Zenith Tracker</p>
        <p className="zt-footer-tagline">Acompanhamento nutricional do treino híbrido.</p>
        {loggedIn ? null : (
          <nav className="zt-footer-nav" aria-label="Rodapé">
            <Link href="/cadastro">Cadastro</Link>
            <Link href="/login">Entrar</Link>
          </nav>
        )}
      </div>
    </footer>
  );
}
