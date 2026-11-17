# Parecer de Código — Tarefa 5

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

Regra no service (`findCurrentPendingOrder` + update/create); `amountCents` do catálogo; e2e HTTP com contagem = 1.

## Sugestões (não bloqueiam)

- Unicidade “um PENDING por treinador” (§5.2) só na aplicação — sem índice parcial no Prisma; risco sob concorrência.
- Swagger do POST ainda fala só em “cria”; o endpoint também atualiza PENDING.
