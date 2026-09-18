"use client";

import { getSessionUser } from "@/lib/session";

export default function TreinadorPage() {
  const name =
    typeof window === "undefined" ? "" : (getSessionUser()?.name ?? "");

  return (
    <main>
      <p>{name}</p>
      {/* TODO #US05: carteira ainda não libera até existir Issue da US05 */}
      <p>carteira ainda não libera</p>
    </main>
  );
}
