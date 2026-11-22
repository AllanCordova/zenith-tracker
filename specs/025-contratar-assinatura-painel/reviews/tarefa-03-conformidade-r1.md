# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA2 — treinador com Assinatura `ACTIVE` no mesmo `planCode` → nenhum Pedido novo | atendido | `apps/api/src/billing/billing.service.ts:52-58`; `apps/api/test/billing.e2e-spec.ts:142-184` |
| CA2 — Pedido `PENDING` existente (se houver) não muda | atendido | `apps/api/test/billing.e2e-spec.ts:161-192` |
| CA2 — UI mostra que a assinatura já está ativa naquele plano | atendido | `apps/web/repositories/billing.ts:44-47`; `apps/web/app/treinador/assinatura/page.tsx:61-67`; `apps/web/__tests__/assinatura.test.tsx:124-150` |
| CA1, CA3–CA10 | fora desta tarefa | plan.md Tarefa 3; despacho |

## Apontamentos

Nenhum.
