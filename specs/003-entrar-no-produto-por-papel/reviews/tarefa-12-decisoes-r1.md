# Decisões — Tarefa 12, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | Schema de `User` entra no Postgres por `CREATE TABLE` via `pg`, não por migração/contrato Prisma | código | aceito | Seguir a arquitetura (ID8): Prisma como única porta e migração/contrato no repositório |
