# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — conta existente, e-mail ou senha errados: não entra, nenhum JWT gravado, combinação não confere sem dizer qual falhou | atendido | `apps/api/src/auth/auth.service.ts:51-54`; `apps/web/app/login/page.tsx:17-22`; e2e `apps/api/test/auth.e2e-spec.ts:187-234`; Vitest `apps/web/__tests__/login.test.tsx:36-54` |
| CA1 | fora desta tarefa | — |
| CA2 | fora desta tarefa | — |
| CA4 | fora desta tarefa | — |
| CA5 | fora desta tarefa | — |
| CA6 | fora desta tarefa | — |
| CA7 | fora desta tarefa | — |
| CA8 | fora desta tarefa | — |
| CA9 | fora desta tarefa | — |
| CA10 | fora desta tarefa | — |
| CA11 | fora desta tarefa | — |
| CA12 | fora desta tarefa | — |
| CA13 | fora desta tarefa | — |

## Apontamentos

Testes rodados: `apps/api` e2e 7/7 passou; `apps/web` Vitest 9/9 passou. O diff fica nos arquivos previstos da tarefa (login API + `/login` + repositório + testes); o caminho feliz do login está no plano da tarefa e no contrato da spec, não infla CA1–CA2 nem CA4–CA13.
