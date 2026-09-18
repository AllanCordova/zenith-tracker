# Parecer de Código — Tarefa 1

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- `POST /probe` no `AppController` existe só para exercitar o `ValidationPipe`. Quando nascer uma rota de escrita de verdade (`/auth/register`), essa sonda e o `ProbeWriteDto` em `common/` podem sair.
- `db.ts` captura `process.env['DATABASE_URL']` na importação, antes do `ConfigModule` carregar o `.env`. Em `nest start` local a URL pode nascer `undefined`; o JWT não tem esse problema porque passa pelo `ConfigService`. Vale garantir que o processo já tenha a variável no ambiente (como o CI e a plataforma farão).

## Observações fora do escopo deste diff

- Swagger ainda não é servido em `/docs` (ID14); bcrypt/passport estão no `package.json` sem uso — cabem nas tarefas de `auth/`.
- `JwtModule` global no `AppModule` é o destravar desta tarefa; o plano coloca JWT em `auth/` nas tarefas seguintes.
- Suíte pedida: `npm test` (2 suites), `npm run test:e2e` (2 testes) e `npm run lint` passaram em `apps/api`.
