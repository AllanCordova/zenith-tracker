"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductShell } from "@/components/product-shell";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/lib/toast";
import { areaPathForRole, clearSession, getAccessToken, getSessionUser } from "@/lib/session";

export default function TreinadorPage() {
  const router = useRouter();
  const token = getAccessToken();
  const user = getSessionUser();
  const role = user?.role;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (role === "STUDENT") {
      router.push(areaPathForRole(role));
    }
  }, [token, role, router]);

  if (!token || role === "STUDENT") {
    return null;
  }

  function onLogout() {
    clearSession();
    toastSuccess("Você saiu");
    router.push("/login");
  }

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Treinador</h1>
        <p className="zt-corpo mt-2">{user?.name ?? ""}</p>
        {/* TODO #12: carteira com alunos reais */}
        <p className="zt-apoio mt-6">carteira ainda não libera</p>
        <p className="zt-corpo mt-4">
          <Link href="/treinador/assinatura" className="underline">
            Contratar assinatura
          </Link>
        </p>
        <Button variant="danger" type="button" onClick={onLogout}>
          Sair
        </Button>
      </main>
    </ProductShell>
  );
}
