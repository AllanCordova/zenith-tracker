"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductShell } from "@/components/product-shell";
import { Button } from "@/components/ui/button";
import { areaPathForRole, clearSession, getAccessToken, getSessionUser } from "@/lib/session";

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

  function onLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Aluno</h1>
        <p className="zt-corpo mt-token-sm">{user?.name ?? ""}</p>
        {/* TODO #US04: plano ainda não fechado até existir Issue da US04 */}
        <p className="zt-apoio mt-token-lg">plano ainda não fechado</p>
        <Button variant="danger" type="button" onClick={onLogout}>
          Sair
        </Button>
      </main>
    </ProductShell>
  );
}
