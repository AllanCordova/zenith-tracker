# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — cadastro com e-mail novo cria conta, devolve JWT, grava no `localStorage` e cai na área do papel com o nome e o substituto | atendido | `apps/api/src/auth/auth.service.ts:23-40`; `apps/api/test/auth.e2e-spec.ts:39-115`; `apps/web/app/cadastro/page.tsx:16-21`; `apps/web/lib/session.ts:11-14`; `apps/web/app/aluno/page.tsx:5-14`; `apps/web/app/treinador/page.tsx:5-14`; `apps/web/__tests__/cadastro.test.tsx:48-122` |
| CA11 — fechar/desmontar o cadastro sem confirmar com sucesso não cria conta | atendido | `apps/web/app/cadastro/page.tsx:16-21`; `apps/web/__tests__/cadastro.test.tsx:124-138` |
| CA2–CA13 | fora desta tarefa | — |

## Apontamentos

Testes rodados: `apps/api` — `npm test` (2/2), `npm run test:e2e` (4/4), `npm run lint`; `apps/web` — `npx vitest run` (4/4), `npm run lint`.
