# Parecer de Conformidade — Tarefa 12

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 (API): cadastro aluno/treinador devolve `accessToken` + `user` sem `passwordHash`; e-mail em minúsculas; `GET /auth/me` devolve o nome | atendido | `apps/api/test/auth.e2e-spec.ts:39-115` |
| CA2 (API): e-mail já cadastrado (outra capitalização) não cria outra conta | atendido | `apps/api/test/auth.e2e-spec.ts:117-152` |
| CA3 (API): e-mail ou senha errados → 401, mesma mensagem de combinação, sem JWT | atendido | `apps/api/test/auth.e2e-spec.ts:154-234` |
| CA4 (API): JWT `STUDENT` em rota de treinador → 403 sem recurso | atendido | `apps/api/test/auth.e2e-spec.ts:252-279` |
| CA5 (API): JWT `TRAINER` em rota de aluno → 403 sem recurso | atendido | `apps/api/test/auth.e2e-spec.ts:281-308` |
| CA6 (API): sem Bearer, `GET /auth/me` e rotas de área → 401 | atendido | `apps/api/test/auth.e2e-spec.ts:236-250` |
| CA9 (API): senha curta / sem letra / sem dígito → 400, conta não criada | atendido | `apps/api/test/auth.e2e-spec.ts:310-421` |
| CA10 (API): nome vazio, e-mail inválido, papel ausente/inválido, campo extra → 400, sem stack e sem senha | atendido | `apps/api/test/auth.e2e-spec.ts:310-421` |
| Evidência ao vivo: `npm run test:e2e` contra PostgreSQL em `127.0.0.1:5432` | atendido | 3 suites / 16 testes passaram; `docker-compose.yml:9-17`, `apps/api/.env.example:5`, `apps/api/test/setup-e2e.ts:38-46` |
| CA1–CA6 (metade UI: `localStorage`, rotas `/aluno` `/treinador` `/login`) | fora desta tarefa | — |
| CA7, CA8, CA11, CA12, CA13 | fora desta tarefa | — |
| Tarefa 13 (`POST /probe`) | fora desta tarefa | `apps/api/test/app.e2e-spec.ts:31` permanece intacto |

## Apontamentos

O diff não reescreveu register/login/403 (`auth.e2e-spec.ts` e `apps/api/src/` intactos). Termos batem com o glossário (`User`, `STUDENT`/`TRAINER`, `accessToken`, `passwordHash`). A suíte e2e rodou de ponta a ponta contra o Postgres em `127.0.0.1:5432`.
