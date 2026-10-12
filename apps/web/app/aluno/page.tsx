"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductShell } from "@/components/product-shell";
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
    <ProductShell>
      <main>
        <p className="zt-kicker">Área do aluno</p>
        <h1 className="zt-titulo mt-2">Aluno</h1>
        <p className="zt-subtitulo mt-2">{user?.name ?? ""}</p>
        <section className="zt-area-bloco">
          {/* TODO #US04: plano ainda não fechado até existir Issue da US04 */}
          <p className="zt-apoio">plano ainda não fechado</p>
        </section>
      </main>
    </ProductShell>
  );
}
