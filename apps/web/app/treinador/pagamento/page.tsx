"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { ProductShell } from "@/components/product-shell";
import { FormError } from "@/components/ui/form-error";
import { useCheckoutConfig } from "@/hooks/use-checkout-config";
import { useCurrentOrder } from "@/hooks/use-current-order";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";
import { chargeOrder } from "@/repositories/billing";

export default function PagamentoPage() {
  const router = useRouter();
  const [error, setError] = useState("");
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
  const orderId = currentOrder.data?.id;

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Pagamento</h1>
        <p className="zt-corpo mt-2">
          Formulário do Mercado Pago (Checkout Transparente).
        </p>
        {checkout.data?.publicKey && amount != null && orderId ? (
          <div className="mt-8">
            <CardPayment
              initialization={{ amount }}
              onSubmit={async (formData) => {
                setError("");
                try {
                  await chargeOrder({ orderId, token: formData.token });
                  router.push("/treinador/pagamento/status");
                } catch (caught) {
                  if (caught instanceof Error) {
                    setError(caught.message);
                    return;
                  }
                  setError("Não deu certo. Verifique a conexão.");
                }
              }}
            />
          </div>
        ) : (
          <p className="zt-apoio mt-8">Carregando formulário…</p>
        )}
        <FormError>{error}</FormError>
      </main>
    </ProductShell>
  );
}
