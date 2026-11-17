"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductShell } from "@/components/product-shell";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { useBillingPlans } from "@/hooks/use-billing-plans";
import { useCreateOrder } from "@/hooks/use-create-order";
import { useCurrentOrder } from "@/hooks/use-current-order";
import { areaPathForRole, getAccessToken, getSessionUser } from "@/lib/session";
import type { PlanCode } from "@/repositories/billing";

function formatBRL(amountCents: number): string {
  return (amountCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function planLabel(planCode: PlanCode): string {
  return planCode === "MONTHLY" ? "Mensal" : "Anual";
}

export default function AssinaturaPage() {
  const router = useRouter();
  const token = getAccessToken();
  const user = getSessionUser();
  const role = user?.role;
  const allowed = Boolean(token && role === "TRAINER");
  const plans = useBillingPlans();
  const createOrder = useCreateOrder();
  const currentOrder = useCurrentOrder(allowed);
  const [selected, setSelected] = useState<PlanCode | null>(null);
  const [error, setError] = useState("");

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
    if (currentOrder.data?.status === "PENDING") {
      router.push("/treinador/pagamento");
    }
  }, [currentOrder.data, router]);

  if (!token || role === "STUDENT") {
    return null;
  }

  async function onConfirm() {
    if (!selected) {
      return;
    }
    setError("");
    try {
      const order = await createOrder.mutateAsync(selected);
      if (!order) {
        setError("Não deu certo criar o pedido.");
        return;
      }
      router.push("/treinador/pagamento");
    } catch (caught) {
      if (
        caught instanceof Error &&
        /já está ativa/i.test(caught.message)
      ) {
        setError(caught.message);
        return;
      }
      setError("Não deu certo. Verifique a conexão.");
    }
  }

  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Assinatura</h1>
        <p className="zt-corpo mt-2">Escolha o plano do painel.</p>

        <div className="mt-8 flex flex-col gap-4">
          {(plans.data ?? []).map((plan) => (
            <button
              key={plan.planCode}
              type="button"
              className={
                selected === plan.planCode
                  ? "zt-btn"
                  : "zt-btn border border-line bg-transparent text-ink"
              }
              onClick={() => setSelected(plan.planCode)}
            >
              {planLabel(plan.planCode)} — {formatBRL(plan.amountCents)}
            </button>
          ))}
        </div>

        <FormError>{error}</FormError>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            type="button"
            loading={createOrder.isPending}
            disabled={!selected || createOrder.isPending}
            onClick={onConfirm}
          >
            Confirmar
          </Button>
          <Link href="/treinador" className="zt-corpo underline">
            Voltar ao painel
          </Link>
        </div>
      </main>
    </ProductShell>
  );
}
