"use client";

import { getSessionUser } from "@/lib/session";

export default function AlunoPage() {
  const name =
    typeof window === "undefined" ? "" : (getSessionUser()?.name ?? "");

  return (
    <main>
      <p>{name}</p>
      {/* TODO #US04: plano ainda não fechado até existir Issue da US04 */}
      <p>plano ainda não fechado</p>
    </main>
  );
}
