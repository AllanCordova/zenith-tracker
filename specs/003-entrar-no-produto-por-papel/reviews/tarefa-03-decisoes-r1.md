# Decisões — Tarefa 3, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | O `try/catch` da tela não encontra o 409 real; o Vitest só passa com `mockRejectedValue` | código | aceito | Corrigir adaptando o teste ao modo como a página/`register` funciona: `fetch` em 409 não rejeita. Não tratar duplicata como se o repositório lançasse exceção. |
| 2 | Qualquer rejeição vira “Este e-mail já existe” | código | aceito | Essa mensagem só vale quando o e-mail já existe. Erro de conexão (e demais vertentes) deve ter mensagem da própria vertente, não a de duplicata. |
