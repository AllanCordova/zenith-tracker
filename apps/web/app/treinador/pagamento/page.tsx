"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { ProductShell } from "@/components/product-shell";
import { useCheckoutConfig } from "@/hooks/use-checkout-config";
import { useCurrentOrder } from "@/hooks/use-current-order";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";

export default function PagamentoPage() {
  const router = useRouter();
  const token = getAccessToken();
  const user = getSessionUser();
  const role = user?.role;
  const allowed = Boolean(token && role === "TRAINER");
  const checkout = useCheckoutConfig(allowed);
  const currentOrder = useCurrentOrder(allowed);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (role === "STUDENT") {
      router.push(areaPathForRole(role));
    }
  }, [token, role, router]);

  useEffect(() => {
    if (checkout.data?.publicKey) {
      initMercadoPago(checkout.data.publicKey);
    }
  }, [checkout.data?.publicKey]);

  if (!token || role === "STUDENT") {
    return null;
  }

  const amount = currentOrder.data?.amountCents
    ? currentOrder.data.amountCents / 100
    : undefined;

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Pagamento</h1>
        <p className="zt-corpo mt-2">
          Formulário do Mercado Pago (Checkout Transparente).
        </p>
        {/* TODO #26: cobrar o token do cartão; esta tela só monta o formulário */}
        {checkout.data?.publicKey && amount != null ? (
          <div className="mt-8">
            <CardPayment
              initialization={{ amount }}
              onSubmit={async () => {
                // TODO #26: enviar token à API para cobrança
              }}
            />
          </div>
        ) : (
          <p className="zt-apoio mt-8">Carregando formulário…</p>
        )}
      </main>
    </ProductShell>
  );
}
