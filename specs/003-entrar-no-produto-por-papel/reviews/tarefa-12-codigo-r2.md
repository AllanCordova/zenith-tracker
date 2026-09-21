# Parecer de Código — Tarefa 12

**Veredito:** APROVADO

O apontamento aceito da rodada 1 está corrigido neste diff: `ensure-user-schema.cjs` / `pg` sumiram; o schema de `User` entra por pacote Prisma 8 no repositório (`migrations/app/20260921T1751_init_user/`, snapshot com o mesmo `storageHash` do `contract.json` vivo) e o e2e aplica com `prisma db migrate`. Consulta ao banco no teste vivo passa por `src/prisma/db.ts`. `pg` não é dependência direta.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres` em `apps/api/.env.example:5` e o fallback igual em `apps/api/test/setup-e2e.ts:38-39` documentam o Compose (a tarefa pede isso), mas tensionam o ID17. A senha já estava no `docker-compose.yml`; o risco não é vazamento de produção. O `JWT_SECRET=` vazio no mesmo arquivo é o padrão certo.
- `apps/api/test/postgres.e2e-spec.ts:39-52` e `:54-65` grepam texto de `.env.example`/YAML e só checam se existe algum `migration.json`. Quebram com aspas/layout do Prisma 8 sem mudar o comportamento. A prova viva é `prisma migration log` + `db.orm.public.User.first` (`postgres.e2e-spec.ts:67-87`).
- O caso do log usa `.some()` (`postgres.e2e-spec.ts:76-78`): passa se *qualquer* migração commitada estiver aplicada, não se *todas* estiverem.
- `setup-e2e.ts:42-46` chama `prisma db migrate` com `stdio: 'pipe'`. Falha de conexão aparece no JSON de stdout; o stderr do Prisma 8 (`Prisma agent skills are out of date`) é o que o Jest mostra primeiro. `setupFiles` dispara o migrate em **toda** a suíte — `app.e2e-spec.ts` (`GET /`, CORS, `/probe`) passa a exigir Postgres no ar mesmo sem bater no banco.

## Observações fora do escopo deste diff

- Healthcheck `pg_isready` no Compose da raiz está alinhado ao banco local da arquitetura.
- Nesta revisão, `cd apps/api && npm run test:e2e` falhou nas 3 suítes: Postgres inacessível (`DRIVER.CONNECTION_FAILED` / `ECONNREFUSED 127.0.0.1:5432`). Não é defeito de arquitetura do diff (mesmo recorte da rodada 1).
- O CI ainda não tem job com Postgres de serviço (ID18). Quando existir, o `setupFiles` do e2e já tenta aplicar as migrações commitadas.
