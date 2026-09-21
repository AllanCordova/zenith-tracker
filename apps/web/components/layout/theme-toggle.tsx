"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function useIsClient() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsClient();
  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button
      type="button"
      className="zt-theme-toggle"
      aria-label={label}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </button>
  );
}
