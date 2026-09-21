import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="zt-header">
      <Link href="/" className="zt-header-marca">
        Zenith Tracker
      </Link>
      <ThemeToggle />
    </header>
  );
}
