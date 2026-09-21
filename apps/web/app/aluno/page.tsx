"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getSessionUser } from "@/lib/session";

export default function AlunoPage() {
  const router = useRouter();
  const user = getSessionUser();
  const role = user?.role;

  useEffect(() => {
    if (role === "TRAINER") {
      router.push(areaPathForRole(role));
    }
  }, [role, router]);

  if (role === "TRAINER") {
    return null;
  }

  return (
    <main>
      <p>{user?.name ?? ""}</p>
      {/* TODO #US04: plano ainda não fechado até existir Issue da US04 */}
      <p>plano ainda não fechado</p>
    </main>
  );
}
