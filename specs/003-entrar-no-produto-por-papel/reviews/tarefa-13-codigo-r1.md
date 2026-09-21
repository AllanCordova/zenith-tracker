# Parecer de Código — Tarefa 13

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

A sonda saiu de produção: `AppController` ficou só no `GET /`, `ProbeWriteDto` foi apagado e não resta import. O e2e de envelope 400 (ID7 + ID10) agora bate em `POST /auth/register` — rota de escrita da spec, DTO + `ValidationPipe` globais — e ainda confere `{ statusCode, message, error }`, chaves exatas, ausência de stack/token/senha, e que a conta não nasceu (login 401). Camadas intactas: controller sem Prisma. `test/app.e2e-spec.ts`: 5 passed.

## Sugestões (não bloqueiam)

- O caso “campo extra → 400 + envelope + senha fora do corpo + conta inexistente” já existe em `apps/api/test/auth.e2e-spec.ts` (CA10). O teste em `app.e2e-spec.ts` sobrepõe essa regra; a tarefa pedia a prova de envelope neste arquivo, então não é defeito — só manutenção em dobro se o contrato de erro mudar.
- `POST /probe is gone` (`app.e2e-spec.ts:65-71`) é sentinela de regressão; não confere o envelope ID10 no 404. Prejuízo baixo: Nest já responde 404 em rota inexistente.

## Observações fora do escopo deste diff

- `GET /` + `Hello World!` continuam no `AppController` de produção (scaffold; a spec não pede essa rota).
- Jest avisou handles abertos ao sair da suíte (Prisma no `AppModule`); já ocorria com o `setupFiles` da Tarefa 12.
