# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — treinador com Assinatura `ACTIVE` no plano atual + `planCode` diferente → nasce Pedido `PENDING` com novo `planCode`/`amountCents` | atendido | `apps/api/src/billing/billing.service.ts:52-68`; `apps/api/test/billing.e2e-spec.ts:195-236` |
| CA3 — fluxo até `/treinador/pagamento` | atendido | `apps/web/app/treinador/assinatura/page.tsx:49-60`; `apps/web/__tests__/assinatura.test.tsx:153-183` |
| CA3 — Assinatura atual permanece `ACTIVE` | atendido | `apps/api/test/billing.e2e-spec.ts:238-243` |
| CA1, CA2, CA4–CA10 | fora desta tarefa | plan.md Tarefa 4; despacho |

## Apontamentos

Nenhum.
