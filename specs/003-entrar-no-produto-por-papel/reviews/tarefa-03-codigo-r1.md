# Parecer de Código — Tarefa 3

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)
1. **O caminho de erro do cadastro não usa o contrato HTTP do repositório e o teste fica verde à toa** — `apps/web/app/cadastro/page.tsx:19-25`, `apps/web/__tests__/cadastro.test.tsx:140-161`
   Regra violada: `docs/architecture.md` §4 — *“Componente não fala com o servidor. Toda chamada HTTP à API NestJS passa por `apps/web/repositories/`”*; *“Mudança de contrato mexe só nessa camada”*. Também o critério do revisor: tratamento de erro que engole a falha.
   Prejuízo concreto: `register()` em `apps/web/repositories/auth.ts` não olha `response.ok`. Em 409 ele faz `return envelope.data` (`undefined`) e **não rejeita**. O `try/catch` novo nunca corre no browser: a página chama `saveSession(undefined, undefined)` e `router.push` da área do papel. O Vitest só passa porque o mock força `mockRejectedValue`. CA2 na UI real pode gravar JWT inválido e entrar na área.

2. **Qualquer rejeição vira “Este e-mail já existe”** — `apps/web/app/cadastro/page.tsx:23-25`
   Regra violada: tratamento de erro que engole a falha (`docs/architecture.md` ID10 — o cliente não pode mentir o motivo; falha real some).
   Prejuízo concreto: rede, 400, 500 ou bug no `saveSession` mostram e-mail duplicado. Quem já tem conta e quem só perdeu a rede vê a mesma frase; as tarefas de validação e falha de rede herdam esse mapeamento errado.

## Sugestões (não bloqueiam)
- Na API, o `findByEmail` + `create` em `apps/api/src/auth/auth.service.ts:28-38` deixa corrida: dois `POST` simultâneos passam no `if` e o segundo estoura o `@unique` do Prisma. O filter global vira 500 genérico (não vaza stack), e a linha duplicada não nasce — mas a mensagem deixa de ser a do CA2. Mapear violação de unicidade para o mesmo `ConflictException` fecharia o buraco.
- O e2e em `apps/api/test/auth.e2e-spec.ts:117-152` está no ponto certo (status, envelope `{ statusCode, message, error }`, uma linha no banco). O Vitest poderia pelo menos exigir que `register` tenha sido chamado; hoje só olha o texto hardcoded.

## Observações fora do escopo deste diff
- `apps/web/repositories/auth.ts` (Tarefa 2) ignora status HTTP e assume sempre `{ data }`. Sem isso, o catch da Tarefa 3 não tem como funcionar. Candidata a Issue/ajuste na camada de repositório, não só na página.
- Swagger (`/docs`) não anota 409 em `POST /auth/register`; o contrato vivo fica só no filtro + e2e.
- Jest unitário da API: 2 suites ok. Lint api e web: ok. E2e falhou aqui por `ECONNREFUSED 127.0.0.1:5432` (Postgres fora), não por asserção do CA2. Vitest não subiu neste sandbox (`EROFS` ao gravar o config bundled).
