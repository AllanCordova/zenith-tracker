# Parecer de Conformidade — Tarefa 7

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — cadastro com e-mail novo, JWT e área do papel | fora desta tarefa | — |
| CA2 — e-mail já cadastrado | fora desta tarefa | — |
| CA3 — login com e-mail ou senha errados | fora desta tarefa | — |
| CA4 — aluno em rota de treinador | fora desta tarefa | — |
| CA5 — treinador em rota de aluno | fora desta tarefa | — |
| CA6 — visitante sem JWT em `/aluno` ou `/treinador` vai para `/login` e não vê nome, plano nem carteira | atendido | `apps/web/app/aluno/page.tsx:13-25`; `apps/web/app/treinador/page.tsx:13-25`; `apps/web/lib/session.ts:16-21`; `apps/web/__tests__/aluno.test.tsx:20-28`; `apps/web/__tests__/treinador.test.tsx:20-28`; `apps/api/test/auth.e2e-spec.ts:236-250` |
| CA7 — sessão válida em `/cadastro` ou `/login` | fora desta tarefa | — |
| CA8 — logout | fora desta tarefa | — |
| CA9 — senha inválida / confirmação divergente | fora desta tarefa | — |
| CA10 — nome/e-mail/papel inválidos ou campo extra | fora desta tarefa | — |
| CA11 — fechar a aba no meio do cadastro | fora desta tarefa | — |
| CA12 — rede falha no confirmar | fora desta tarefa | — |
| CA13 — JWT expirado | fora desta tarefa | — |

## Apontamentos
