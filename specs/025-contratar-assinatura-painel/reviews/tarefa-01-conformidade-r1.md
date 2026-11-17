# Parecer de Conformidade — Tarefa 1

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec / plan da tarefa) | Situação | Onde |
| --- | --- | --- |
| CA1–CA10 (negócio) | fora desta tarefa | plan.md Tarefa 1: “Cobre: nenhum CA” |
| Contrato Prisma declara `Order` com campos da spec/plan | atendido | `apps/api/src/prisma/contract.prisma` |
| Contrato Prisma declara `Subscription` com campos da spec/plan | atendido | `apps/api/src/prisma/contract.prisma` |
| Migration cria tabelas/FKs alinhadas ao contrato | atendido | `apps/api/migrations/app/20261117T0216_order_subscription/` |
| Glossário/ER com `amountCents` e `planCode` na Subscription | atendido | `docs/architecture.md` |
| Teste de contrato | atendido | `apps/api/src/prisma/contract.spec.ts` |
| Sem inflar escopo (billing/UI/cobrança) | atendido | só Prisma + migration + architecture |

## Apontamentos

Nenhum.
