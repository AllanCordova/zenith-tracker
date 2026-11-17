# Decisões — Tarefa 2, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | `temporal-polyfill` sem autorização em `docs/architecture.md` §2 | código | aceito | Necessário porque o Prisma 8 usa codec Temporal em DateTime e o Node 24 ainda não possui suporte nativo — incluir na tabela `api`. |
