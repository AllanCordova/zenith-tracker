# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — confirmar `MONTHLY`/`YEARLY` cria Pedido `PENDING` com `planCode`/`amountCents` do catálogo do servidor | atendido | `apps/api/src/billing/plan-catalog.ts:3-5`; `apps/api/src/billing/billing.service.ts:48-58`; `apps/api/src/billing/dto/create-order.dto.ts:4-7`; `apps/api/test/billing.e2e-spec.ts:67-114` |
| CA1 — após confirmar, `/treinador/pagamento` com formulário MP (Checkout Transparente) | atendido | `apps/web/app/treinador/assinatura/page.tsx:49-60`; `apps/web/app/treinador/pagamento/page.tsx:51-59`; `apps/web/__tests__/assinatura.test.tsx:42-92` |
| CA1 — public key só para treinador (`GET /billing/checkout-config`) | atendido | `apps/api/src/billing/billing.controller.ts:29-30,67-74`; `apps/api/src/billing/billing.service.ts:42-45`; `apps/api/test/billing.e2e-spec.ts:116-130` |
| CA5 — sair de `/treinador/assinatura` sem confirmar com sucesso → nenhum Pedido | atendido | `apps/web/app/treinador/assinatura/page.tsx:49-64,91-102` (POST só em Confirmar); `apps/web/__tests__/assinatura.test.tsx:95-121` |
| Correção r1 — `temporal-polyfill` autorizado | atendido | `docs/architecture.md:60` (tabela §2 `api`) |
| CA2–CA4, CA6–CA10; cobrança token / webhook | fora desta tarefa | plan.md Tarefa 2; despacho |

## Apontamentos

Nenhum.
