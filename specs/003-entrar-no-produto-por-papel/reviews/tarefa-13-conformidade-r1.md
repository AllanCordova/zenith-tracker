# Parecer de Conformidade — Tarefa 13

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| Contrato da API: `POST /auth/register`, `POST /auth/login`, `GET /auth/me` — a spec não pede `POST /probe` | atendido | `apps/api/src/app.controller.ts:1-12` (só `GET /`); `apps/api/src/common/probe-write.dto.ts` apagado; `apps/api/src/` sem `ProbeWriteDto` nem `/probe` |
| CA10 — campo extra no body → 400, conta não criada, sem stack e sem senha no corpo (prova relocada para rota da spec) | atendido | `apps/api/test/app.e2e-spec.ts:31-63` (`POST /auth/register` + login 401); envelope `{ statusCode, message, error }` |
| Sem inflar: `GET /` e CORS no mesmo arquivo não são o alvo da remoção | atendido | `apps/api/src/app.controller.ts:8-11`; `apps/api/test/app.e2e-spec.ts:24-29` e `:73-93` intactos |
| CA1–CA9, CA11–CA13 | fora desta tarefa | — |

## Apontamentos

O diff fica nos três arquivos previstos. A prova de campo extra deixou de usar `/probe` e passou a `POST /auth/register`. O caso `POST /probe is gone` (`app.e2e-spec.ts:65-71`) só documenta a ausência (404), não reabre a sonda.

O comando `npm run test:e2e -- test/app.e2e-spec.ts` não chegou aos asserts: `setup-e2e.ts` falha em `prisma db migrate` porque `127.0.0.1:5432` está fechado neste ambiente. Isso não é regressão do diff da tarefa 13.
