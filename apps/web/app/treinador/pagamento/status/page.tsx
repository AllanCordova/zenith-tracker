"use client";

import { ProductShell } from "@/components/product-shell";

/** Stub mínimo para navegação pós-charge (tela completa na Tarefa 4). */
export default function PagamentoStatusPage() {
  return (
    <ProductShell>
      <main>
        <h1 className="zt-titulo">Status do pagamento</h1>
        <p className="zt-corpo mt-2">Consultando o Pedido…</p>
      </main>
    </ProductShell>
  );
}
