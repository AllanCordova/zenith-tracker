import Link from "next/link";
import { Users } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="zt-header">
      <div className="zt-header-inner">
        <Link href="/" className="zt-header-marca">
          Zenith Tracker
        </Link>
        <div className="zt-header-acoes">
          <Link href="/login" className="zt-icon-btn" aria-label="Entrar">
            <Users aria-hidden />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
