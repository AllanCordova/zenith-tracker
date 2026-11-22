# Parecer de Código — Tarefa 1

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- Cardinalidade do ER vs schema: índices de `trainerId`/`orderId` em Subscription não únicos; `@unique` fecharia o `||--o|` se a regra for uma linha por treinador.
- Unicidade de Pedido Pendente: pode ficar na regra do service (T2/T5 / RN13).
- Snapshot `.tmp-*`: não versionar (não encontrado no stage desta rodada).
