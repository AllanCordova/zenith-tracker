# Parecer de Conformidade — Tarefa 6

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA6 — visitante sem JWT → **401**, nenhum Pedido | atendido | `apps/api/test/billing.e2e-spec.ts:314-338`; guards em `billing.controller.ts` |
| CA7 — `STUDENT` → **403**, sem Pedido | atendido | `apps/api/test/billing.e2e-spec.ts:341-378` |
| CA7 — UI: aluno fora de `/treinador/assinatura` e `/treinador/pagamento` | atendido | `apps/web/__tests__/assinatura.test.tsx:185-225` |
| CA1–CA5, CA8–CA10 | fora desta tarefa | plan.md Tarefa 6 |

## Apontamentos

Nenhum.
