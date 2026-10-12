"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useHasSession } from "@/hooks/use-has-session";
import { clearSession } from "@/lib/session";
import { toastSuccess } from "@/lib/toast";

const NAV = [
  { href: "/#produto", label: "Produto" },
  { href: "/#funcionalidades", label: "Funcionalidades" },
  { href: "/#treinadores", label: "Para treinadores" },
  { href: "/#alunos", label: "Para alunos" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const loggedIn = useHasSession();

  function onLogout() {
    clearSession();
    toastSuccess("Você saiu");
    router.push("/login");
  }

  return (
    <header className="zt-header">
      <div className="zt-header-inner">
        <Link href="/" className="zt-header-marca">
          Zenith Tracker
        </Link>
        {pathname === "/" ? (
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Seções">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
        <div className="zt-header-acoes">
          {loggedIn ? (
            <button type="button" className="zt-icon-btn" aria-label="Sair" onClick={onLogout}>
              <LogOut aria-hidden />
            </button>
          ) : (
            <Link href="/login" className="zt-icon-btn" aria-label="Entrar">
              <User aria-hidden />
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
