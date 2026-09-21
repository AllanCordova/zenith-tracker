# Parecer de Conformidade — Tarefa 9

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA9 — senha curta / sem letra / sem dígito → conta não criada, recusa 400 da API; confirmação divergente nem dispara a API | atendido | `apps/api/src/auth/dto/register.dto.ts:12-15`; `apps/web/app/cadastro/page.tsx:34-37`; `apps/api/test/auth.e2e-spec.ts:310-420`; `apps/web/__tests__/cadastro.test.tsx:221-238` |
| CA10 — nome vazio, e-mail sem formato, papel ausente/inválido ou campo extra → API 400, conta não criada, “os dados não passaram”, sem stack e sem senha no corpo | atendido | `apps/api/src/auth/dto/register.dto.ts:4-18`; `apps/web/repositories/auth.ts:37-39`; `apps/web/app/cadastro/page.tsx:46-49`; `apps/api/test/auth.e2e-spec.ts:343-419`; `apps/web/__tests__/cadastro.test.tsx:241-304` |
| CA1–CA8, CA11–CA13 | fora desta tarefa | — |

## Apontamentos

Testes: `apps/api` e2e **11/11** passou; Vitest `cadastro.test.tsx` **13/13** passou. Glossário (`User`, `STUDENT` \| `TRAINER`) alinhado a `docs/architecture.md`.
