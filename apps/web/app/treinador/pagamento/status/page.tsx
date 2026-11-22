"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductShell } from "@/components/product-shell";
import { useCurrentOrder } from "@/hooks/use-current-order";
import { useCurrentSubscription } from "@/hooks/use-current-subscription";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";

export default function PagamentoStatusPage() {
  const router = useRouter();
  const token = getAccessToken();
  const user = getSessionUser();
  const role = user?.role;
  const allowed = Boolean(token && role === "TRAINER");
  const currentOrder = useCurrentOrder(allowed);
  const subscription = useCurrentSubscription(allowed);

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

  const loading =
    currentOrder.isLoading ||
    currentOrder.isFetching ||
    subscription.isLoading ||
    subscription.isFetching;
  const orderPending = currentOrder.data?.status === "PENDING";
  const active = subscription.data?.status === "ACTIVE";

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Status do pagamento</h1>
        {loading ? (
          <p className="zt-corpo mt-2">Consultando o Pedido…</p>
        ) : null}
        {!loading && orderPending && !active ? (
          <>
            <p className="zt-corpo mt-2">Pendente</p>
            <p className="zt-apoio mt-4" role="status">
              A notificação ainda não chegou. O pedido continua Pendente e a
              carteira ainda não libera.
            </p>
            <p className="zt-corpo mt-6">
              <Link href="/treinador" className="underline">
                Voltar ao painel
              </Link>
            </p>
          </>
        ) : null}
      </main>
    </ProductShell>
  );
}
