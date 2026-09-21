# Parecer de Código — Tarefa 2

**Veredito:** APROVADO

O diff respeita a régua de `docs/architecture.md`. Controller de `auth/` só valida DTO e chama o service; hash, e-mail em minúsculas e JWT ficam em `AuthService`; persistência passa por `UsersService` + `PrismaService`; páginas Client Component não fazem `fetch` — só `apps/web/repositories/auth.ts`. Envelope `{ statusCode, data }`, Bearer em `/auth/me` e ausência de `passwordHash` na resposta batem com ID9/ID10. Os testes cobrem o contrato HTTP e o limite repositório/página, não o miolo do Nest.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- **`JwtStrategy.validate` devolve o `User` completo, inclusive `passwordHash`** — `apps/api/src/auth/jwt.strategy.ts:24-29` e `apps/api/src/auth/auth.controller.ts:17-18`. `/me` sanitiza hoje via `toPublicUser`, e o e2e confere o corpo. O prejuízo é o pé na porta: o próximo endpoint que retornar `req.user` vaza senha (ID10). Melhor o `validate` já devolver só o usuário público.
- **`register` no front não olha `response.ok`** — `apps/web/repositories/auth.ts:22-29`. `fetch` não rejeita 4xx/5xx; o cadastro grava sessão e navega mesmo assim (`apps/web/app/cadastro/page.tsx:16-21`). As tarefas 9 e 10 vão esbarrar nisso; o repositório é o lugar de falhar alto no envelope de erro.
- **`UsersModule` registra outro `PrismaService`** — `apps/api/src/users/users.module.ts:5-7`, além do `AppModule`. Funciona porque `db` é singleton, mas ID8 pede um único acesso via `PrismaService`. Um `PrismaModule` exportado evita N instâncias quando nascerem outros domínios.
- **Áreas leem `localStorage` no render** — `apps/web/app/aluno/page.tsx:6-7` e `apps/web/app/treinador/page.tsx:6-7`. No Client Component do App Router isso hidrata vazio no servidor e com nome no cliente. `useState`/`useEffect` evita o mismatch.
- **`findByEmail` não tem chamado neste diff** — `apps/api/src/users/users.service.ts:26-28`. Pode esperar a tarefa 4 (login).

## Observações fora do escopo deste diff

- `SwaggerModule` / `/docs` ainda não aparecem em `main.ts` (lacuna da tarefa 1). Os endpoints novos desta tarefa também não têm decorators OpenAPI.
- `process.env.JWT_SECRET ??= 'e2e-only-jwt-secret'` em `apps/api/test/setup-e2e.ts` repete o fallback já usado em `app.e2e-spec.ts` (tarefa 1). Não é segredo de produção, mas continua no Git.
- Neste ambiente de revisão: `npm test` e `npm run lint` da API passaram; `npm run lint` do web passou. `npm run test:e2e` falhou com `ECONNREFUSED 127.0.0.1:5432` (Postgres fora). `npx vitest run` não subiu: sandbox só-leitura não deixa o Vite gravar em `node_modules/.vite-temp`.
