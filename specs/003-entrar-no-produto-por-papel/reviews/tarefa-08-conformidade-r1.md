# Parecer de Conformidade — Tarefa 8

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA7 — sessão válida em `/cadastro` ou `/login` cai na área do papel, sem criar outra conta | atendido | `apps/web/app/cadastro/page.tsx:20-28`; `apps/web/app/login/page.tsx:17-25`; `apps/web/__tests__/cadastro.test.tsx:165-195`; `apps/web/__tests__/login.test.tsx:60-92` |
| CA8 — logout apaga o JWT do `localStorage`, a pessoa vira visitante e a área autenticada exige `/login` | atendido | `apps/web/lib/session.ts:16-19`; `apps/web/app/aluno/page.tsx:27-39`; `apps/web/app/treinador/page.tsx:27-39`; `apps/web/__tests__/aluno.test.tsx:47-68`; `apps/web/__tests__/treinador.test.tsx:47-68` |
| CA1–CA6, CA9–CA13 | fora desta tarefa | — |

## Apontamentos

Vitest em `apps/web`: 5 arquivos, 19 testes, todos passaram. O diff fica no recorte da tarefa (redirect de sessão em `/cadastro` e `/login`, `clearSession`, botão Sair nas áreas, testes correspondentes). Termos (`STUDENT`/`TRAINER`, JWT, `accessToken`, visitante como ausência de sessão) batem com o glossário.
