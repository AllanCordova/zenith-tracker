# Plano — Issue #3

## Decisões técnicas

- Entidade nova só `User` (`id`, `name`, `email` único já em minúsculas, `passwordHash`, `role` `STUDENT` | `TRAINER`). Demais tabelas do ER não nascem nesta Issue.
- Módulos: `common/` (ValidationPipe global, interceptor `{ statusCode, data }`, filter `{ statusCode, message, error }`), `prisma/` (`contract.prisma`, `db.ts`, `PrismaService`), `users/` (persistência), `auth/` (register, login, me, JWT, `AuthGuard`, `RolesGuard`).
- Contrato: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`. Para provar 403 de papel: `GET /student/area` (`STUDENT`) e `GET /trainer/area` (`TRAINER`) — sem dado de plano/carteira.
- JWT: `expiresIn` 24 h, `JWT_SECRET` só em env. Front: `localStorage`, acesso à API só por `apps/web/repositories/`.
- Pacotes desta Issue (lista do `architecture.md`): Config, JWT/Passport, bcrypt, class-validator/transformer, Swagger, Prisma 8. Sem `mercadopago`.
- UI: `/cadastro`, `/login`, `/aluno`, `/treinador` (Client Components). Substitutos com `// TODO #US04` e `// TODO #US05`.
- Logout só no cliente. Sem `POST /auth/logout`.

## Tarefas

- [x] **Tarefa 1 — Destravar User, envelope HTTP e JWT**
  - Cobre: nenhum CA (passo técnico)
  - Teste primeiro: o app de teste sobe com ValidationPipe (whitelist + forbid), interceptor e filter; body com campo extra vira 400 no envelope `{ statusCode, message, error }` sem stack; contrato Prisma declara `User` com `email` único. Falha hoje: não há Prisma, pipe global nem envelope.
  - Arquivos previstos: `apps/api/src/prisma/contract.prisma`, `apps/api/src/prisma/db.ts`, `apps/api/src/prisma.service.ts`, `apps/api/src/common/`, `apps/api/src/app.module.ts`, `apps/api/src/main.ts`, `apps/api/package.json`, `apps/api/test/`

- [x] **Tarefa 2 — Cadastrar visitante e cair na área do papel**
  - Cobre: CA1, CA11
  - Teste primeiro: e2e `POST /auth/register` (aluno e treinador) devolve `accessToken` + `user` sem `passwordHash`, e-mail em minúsculas, senha hasheada; `GET /auth/me` com Bearer devolve o nome. Vitest: confirmar cadastro grava JWT no `localStorage` e cai em `/aluno` ou `/treinador` com o nome e o substituto; desmontar o formulário sem confirmar não chama o repositório (CA11). Falha hoje: não há `/auth/register` nem páginas.
  - Arquivos previstos: `apps/api/src/auth/`, `apps/api/src/users/`, `apps/api/test/`, `apps/web/repositories/`, `apps/web/lib/`, `apps/web/app/cadastro/`, `apps/web/app/aluno/`, `apps/web/app/treinador/`, `apps/web/__tests__/`

- [x] **Tarefa 3 — Recusar e-mail duplicado**
  - Cobre: CA2
  - Teste primeiro: e2e do segundo `POST /auth/register` com o mesmo e-mail em outra capitalização não cria outra linha e responde que o e-mail já existe. Vitest: a tela de cadastro mostra essa mensagem e não grava JWT.
  - Arquivos previstos: `apps/api/src/auth/`, `apps/api/test/`, `apps/web/app/cadastro/`, `apps/web/__tests__/`

- [ ] **Tarefa 4 — Entrar com e-mail e senha da conta existente**
  - Cobre: CA3
  - Teste primeiro: e2e `POST /auth/login` com senha certa devolve token; e-mail errado ou senha errada → 401, mesma mensagem de combinação, sem dizer qual falhou. Vitest: `/login` com erro não grava JWT e mostra o texto genérico; com acerto cai na área do papel.
  - Arquivos previstos: `apps/api/src/auth/`, `apps/api/test/`, `apps/web/app/login/`, `apps/web/repositories/`, `apps/web/__tests__/`

- [ ] **Tarefa 5 — Impedir aluno na área do treinador**
  - Cobre: CA4
  - Teste primeiro: e2e com JWT de aluno em `GET /trainer/area` → 403 sem corpo de recurso. Vitest: sessão aluno em `/treinador` permanece em `/aluno`.
  - Arquivos previstos: `apps/api/src/auth/`, `apps/api/test/`, `apps/web/app/treinador/`, `apps/web/lib/`, `apps/web/__tests__/`

- [ ] **Tarefa 6 — Impedir treinador na área do aluno**
  - Cobre: CA5
  - Teste primeiro: e2e com JWT de treinador em `GET /student/area` → 403 sem corpo de recurso. Vitest: sessão treinador em `/aluno` permanece em `/treinador`.
  - Arquivos previstos: `apps/api/src/auth/`, `apps/api/test/`, `apps/web/app/aluno/`, `apps/web/lib/`, `apps/web/__tests__/`

- [ ] **Tarefa 7 — Levar visitante ao login**
  - Cobre: CA6
  - Teste primeiro: Vitest sem JWT em `/aluno` e em `/treinador` cai em `/login` e não mostra nome, plano nem carteira. E2e: `GET /auth/me` e as rotas de área sem Bearer → 401.
  - Arquivos previstos: `apps/web/app/aluno/`, `apps/web/app/treinador/`, `apps/web/lib/`, `apps/web/__tests__/`, `apps/api/test/`

- [ ] **Tarefa 8 — Redirecionar quem já entrou e sair**
  - Cobre: CA7, CA8
  - Teste primeiro: Vitest com JWT válido em `/cadastro` e `/login` cai na área do papel sem segundo `register`. Logout apaga o JWT do `localStorage`; a área autenticada seguinte exige `/login`.
  - Arquivos previstos: `apps/web/app/cadastro/`, `apps/web/app/login/`, `apps/web/app/aluno/`, `apps/web/app/treinador/`, `apps/web/lib/`, `apps/web/__tests__/`

- [ ] **Tarefa 9 — Recusar senha e payload inválidos no cadastro**
  - Cobre: CA9, CA10
  - Teste primeiro: e2e senha curta / sem letra / sem dígito, nome vazio, e-mail sem formato, `role` ausente ou inválido, campo extra → 400, nenhuma linha `User`. Vitest: confirmação diferente não chama o repositório; as outras recusas mostram que os dados não passaram, sem senha no texto.
  - Arquivos previstos: `apps/api/src/auth/`, `apps/api/test/`, `apps/web/app/cadastro/`, `apps/web/__tests__/`

- [ ] **Tarefa 10 — Tratar falha de rede e JWT expirado**
  - Cobre: CA12, CA13
  - Teste primeiro: Vitest com `fetch` rejeitado no cadastro e no login mostra falha, não grava JWT, não navega à área. JWT expirado no `localStorage` ao abrir área autenticada é descartado e cai em `/login`.
  - Arquivos previstos: `apps/web/repositories/`, `apps/web/lib/`, `apps/web/app/cadastro/`, `apps/web/app/login/`, `apps/web/__tests__/`

## Critérios sem tarefa
