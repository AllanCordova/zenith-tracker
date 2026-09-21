# Parecer de Código — Tarefa 3

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum. Os dois itens aceitos na triagem r1 foram fechados neste diff, sem mexer em `apps/web/repositories/auth.ts`.

- Duplicata: `register` resolve com `undefined` (409 não rejeita o `fetch`); a página recusa `saveSession`/`push` e mostra “Este e-mail já existe”. O Vitest usa `mockResolvedValue(undefined)`.
- Conexão: `catch` mostra “Não deu certo. Verifique a conexão.” e o teste cobre que a frase de duplicata não aparece.
- API: `AuthService` consulta `UsersService.findByEmail` e lança `ConflictException`; o e2e cobre 409 no envelope `{ statusCode, message, error }`, sem `data`/`accessToken`, e uma só linha no banco.

## Sugestões (não bloqueiam)

- `findByEmail` + `create` em `apps/api/src/auth/auth.service.ts:28-38` ainda corre: dois `POST` simultâneos passam no `if` e o segundo estoura o `@unique`. O filter vira 500 genérico (não vaza stack; a linha duplicada não nasce), mas a mensagem deixa de ser a do CA2. Mapear violação de unicidade para o mesmo `ConflictException` fecharia o buraco.
- O Vitest de duplicata em `apps/web/__tests__/cadastro.test.tsx:141-162` não exige que `register` tenha sido chamado; só o texto na tela. Uma asserção no mock deixaria o teste preso ao fluxo, não só à cópia.

## Observações fora do escopo deste diff

- Com o repositório congelado, qualquer `register()` resolvido sem `accessToken`/`user` (400, 500, envelope sem `data`) herda a cópia de duplicata. Distinguir status HTTP continua sendo trabalho da camada `apps/web/repositories/` (Tarefa 2 / 9 / 10), não desta página.
- Swagger (`/docs`) ainda não anota 409 em `POST /auth/register`; o contrato vivo fica no filter + e2e.
- Jest unitário da API: 2 suites ok. Lint api e web: ok. Vitest: 6 testes ok (`--configLoader native` por EROFS no bundle padrão). E2e falhou por `ECONNREFUSED 127.0.0.1:5432` (Postgres fora), inclusive no caso CA1 pré-existente — não por asserção do CA2.
