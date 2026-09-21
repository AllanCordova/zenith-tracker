# Parecer de Código — Tarefa 4

**Veredito:** APROVADO

O diff respeita a régua de `docs/architecture.md`. Controller de `auth/` só valida `LoginDto` e chama o service; e-mail em minúsculas, `bcrypt.compare` e JWT ficam em `AuthService`; persistência passa por `UsersService`. Página Client Component não faz `fetch` — só `apps/web/repositories/auth.ts`. Envelope de erro `{ statusCode, message, error }`, mesma mensagem para e-mail ausente e senha errada, e a UI recusa `saveSession`/`push` quando não há `accessToken`.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- **`onSubmit` de `/login` não tem `try/catch`** — `apps/web/app/login/page.tsx:14-23`. O cadastro já trata rejeição de rede. Se `login()` lançar (rede, JSON inválido), a falha some da tela e o JWT não é gravado — correto — mas o visitante não vê mensagem. CA12 vai esbarrar nisso.
- **`login()` no repositório não lê `response.ok` nem o 401** — `apps/web/repositories/auth.ts:39-47`. `fetch` não rejeita 4xx; devolve `envelope.data` (`undefined`) e a página mapeia qualquer ausência de token para “A combinação não confere”. 400/500 herdam a mesma frase. Distinguir 401/403 nessa camada é o que o §4 pede; o mesmo buraco já existe em `register()` (tarefas 2/3).

## Observações fora do escopo deste diff

- `JwtStrategy.validate` ainda devolve o `User` completo, inclusive `passwordHash` (sugestão da tarefa 2). `/me` sanitiza hoje via `toPublicUser`.
- Swagger (`/docs`) continua sem anotar `POST /auth/login`; o contrato vivo fica no filter + e2e.
- E2e falhou aqui por `ECONNREFUSED 127.0.0.1:5432` (Postgres fora), inclusive nos casos de cadastro pré-existentes — não por asserção do CA3. Vitest deste sandbox não resolveu `@/` nem isolou `apps/web` (mesmo sintoma da tarefa 3).
