# Decisões — Tarefa 2, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | Gateway stuba token `TEST-` e não chama MP | código | aceito | Remover early-return; e2e já usa overrideProvider. |
| 2 | `chargeOrder` engole HTTP e navega sempre | código | aceito | Propagar erro no repositório; `push` só após charge ok. |
