"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";

export default function AlunoPage() {
  const router = useRouter();
  const token = getAccessToken();
  const user = getSessionUser();
  const role = user?.role;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (role === "TRAINER") {
      router.push(areaPathForRole(role));
    }
  }, [token, role, router]);

  if (!token || role === "TRAINER") {
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
