# Parecer de Código — Tarefa 7

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- O gate `!token` → `router.push("/login")` + `return null` está copiado em `apps/web/app/aluno/page.tsx:13-24` e `apps/web/app/treinador/page.tsx:13-24`. A regra de sessão (`getAccessToken`) já é única em `lib/session.ts`; o esqueleto de redirect ainda não. Quando CA13 (JWT expirado) entrar, os dois fluxos podem divergir se só uma página passar a consultar a API.
- `getAccessToken()` e `getSessionUser()` rodam no render (`apps/web/app/aluno/page.tsx:9-10`, espelho em `treinador/page.tsx`). No SSR `window` não existe, então autenticado hidrata de `null` para o conteúdo da área. Ler a sessão depois do mount evita o mismatch; no visitante os dois lados já batem em `null`.
- Os Vitest amarram a ausência de recurso ao copy `plano ainda não fechado` / `carteira ainda não libera` (`apps/web/__tests__/aluno.test.tsx:26-27`, `treinador.test.tsx:26-27`). Esse texto é TODO da US04/US05; o `push("/login")` já cobre o redirecionamento da CA6.
- O e2e novo (`apps/api/test/auth.e2e-spec.ts:236-249`) confere 401 e a ausência de `data`, mas não o envelope `{ statusCode, message, error }` que os casos de 403 da mesma suíte já travam (ID10).

## Observações fora do escopo deste diff

- Token expirado ainda no `localStorage` passa no `if (!token)` e não vai para `/login` (CA13).
- `StudentAreaController` / `TrainerAreaController` continuam em `apps/api/src/auth/`, pasta que o `architecture.md` §3 reserva a JWT, strategies e guards.
- Vitest local em `apps/web`: 4 passou. E2e: o caso novo sem Bearer passou (não fala com o banco); os outros falharam com `ECONNREFUSED 127.0.0.1:5432` — Postgres fora, não defeito do diff.
