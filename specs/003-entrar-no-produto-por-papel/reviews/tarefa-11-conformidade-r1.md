# Parecer de Conformidade — Tarefa 11

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 (cola no browser): visitante em `/cadastro` (`http://localhost:3001`) consegue `POST /auth/register` na API, com preflight CORS (não 404 / não `Cannot OPTIONS`) e cabeçalho `Access-Control-Allow-Origin` | atendido | `apps/api/src/common/configure-app.ts:5-8`; `apps/api/test/app.e2e-spec.ts:50-70` (e2e passou) |
| Equivalente no login: `POST /auth/login` na API (`http://localhost:3000`), não na origem do Next | atendido | `apps/api/src/common/configure-app.ts:8` (CORS global); `apps/web/repositories/auth.ts:30-32,47-49`; `apps/web/__tests__/auth-repository.test.ts:52-58` (Vitest passou) |
| `NEXT_PUBLIC_API_URL` vazio não manda o `fetch` para `:3001` | atendido | `apps/web/repositories/auth.ts:27-32`; `apps/web/__tests__/auth-repository.test.ts:44-50` |
| CA2–CA13 (demais jornadas, abandono, JWT expirado, 403 de papel) | fora desta tarefa | — |

## Apontamentos
