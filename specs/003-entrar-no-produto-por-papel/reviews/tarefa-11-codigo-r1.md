# Parecer de Código — Tarefa 11

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- `UI_ORIGIN` em `apps/api/src/common/configure-app.ts` está fixo em `http://localhost:3001`. O `ConfigModule` já é a porta de valores por ambiente (ID17); JWT já passa pelo `ConfigService`. No primeiro deploy, o Origin da UI não será localhost e o browser bloqueia cadastro/login. Um default local + variável de ambiente evita isso sem mudar a camada.
- O e2e de `OPTIONS` confere `access-control-allow-origin` e “não é 404”, mas não `Access-Control-Allow-Methods`/`Headers`. O default do Nest cobre o `POST`+`content-type` de agora; um CORS mais restrito no futuro ainda passaria nesse teste.

## Observações fora do escopo deste diff

- `login()` em `apps/web/repositories/auth.ts` continua devolvendo `envelope.data` em qualquer status (já apontado nas tarefas 9 e 10).
- `plan.md` ganhou também o texto da Tarefa 12 neste diff; não mexe na arquitetura.
- Suíte pedida: `apps/api` e2e `app.e2e-spec.ts` (4 testes) e Vitest `auth-repository.test.ts` (2 testes) passaram.
