# Parecer de Código — Tarefa 12

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **O schema de `User` entra no Postgres por `CREATE TABLE` silencioso via `pg`, não por migração/contrato Prisma** — `apps/api/test/ensure-user-schema.cjs:3-26` e `apps/api/test/setup-e2e.ts:42-46`

   Regra violada: `docs/architecture.md` §2.1 **Dados (ID8)** — único acesso ao PostgreSQL é `PrismaService` / cliente em `src/prisma/db.ts`; *“migração/contrato no repositório, nunca `db push` silencioso em produção”*. Stack §2: Postgres local é o Compose da raiz; ORM é Prisma 8 (`prisma contract` + `prisma migration` / `prisma db migrate`). `pg` não está na lista de dependências permitidas.

   Prejuízo concreto: o modelo `User` já vive em `apps/api/src/prisma/contract.prisma` (e o check `user_role_check_e82c919a` em `contract.json`). O helper copia isso em SQL e aplica `CREATE TABLE IF NOT EXISTS` em todo `npm run test:e2e`. A tabela antiga/errada não é corrigida; coluna nova no contrato não nasce. Produção e CI ficam sem artefato de migração no Git — o caminho oficial do Prisma 8 (`prisma migration plan` + `prisma db migrate`) não é o que cria o schema. Daqui a três semanas o e2e “passa” contra um dump paralelo, e o banco real diverge do contrato.

## Sugestões (não bloqueiam)

- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres` em `apps/api/.env.example:5` e o fallback igual em `apps/api/test/setup-e2e.ts:38-39` documentam o Compose (a tarefa pede isso), mas tensionam o ID17 (*`DATABASE_URL` nunca no Git*). A senha já estava no `docker-compose.yml`; o risco não é vazamento de produção, é URL de ambiente no código e no exemplo. O `JWT_SECRET=` vazio no mesmo arquivo é o padrão certo.
- `apps/api/test/postgres.e2e-spec.ts:10-23` grepa texto de `.env.example` e do YAML. Quebra com aspas/formatação sem mudar o comportamento. A prova viva é só o caso que consulta via `db.orm.public.User` (`postgres.e2e-spec.ts:25-31`).
- `setupFiles` agora dispara o DDL em **toda** a suíte e2e. `app.e2e-spec.ts` (`GET /`, CORS, `/probe`) passa a exigir Postgres no ar mesmo sem bater no banco.

## Observações fora do escopo deste diff

- Healthcheck `pg_isready` no Compose da raiz está alinhado ao banco local da arquitetura; não é o problema.
- O terceiro teste de `postgres.e2e-spec.ts` usa o cliente Prisma (`src/prisma/db.ts`) — essa porta está correta.
- Nesta revisão, `cd apps/api && npm run test:e2e` falhou com `ECONNREFUSED 127.0.0.1:5432` nas 3 suítes (Postgres inacessível neste ambiente). Não julguei isso como defeito de arquitetura do diff.
- O Prisma 8 do repo já expõe `prisma db init|update|migrate` e `prisma migration plan`. Não há pacote de migração no diff; snapshots locais que apareceram no status inicial não fizeram parte deste julgamento.
