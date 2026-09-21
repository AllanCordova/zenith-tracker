import Link from "next/link";
import { LogIn } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="zt-header">
      <Link href="/" className="zt-header-marca">
        Zenith Tracker
      </Link>
      <div className="zt-header-acoes">
        <Link href="/login" className="zt-icon-btn" aria-label="Entrar">
          <LogIn aria-hidden />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
