# Plano — Issue #25

## Decisões técnicas

- Entidades novas: `Order` (`id`, `trainerId`, `planCode` `MONTHLY`|`YEARLY`, `amountCents`, `status` `PENDING`|`PAID`|`REFUSED`|`EXPIRED`, `createdAt`) e `Subscription` (`id`, `trainerId`, `orderId`, `planCode`, `status` `ACTIVE`|`INACTIVE`, `activatedAt`) — a Assinatura Ativa nesta Issue só é **lida** / semeada nos testes; quem a cria pelo pagamento é a #26 (`// TODO #26`).
- Catálogo só no servidor: `MONTHLY` → `4990`, `YEARLY` → `39900`. `amountCents` no Pedido é sempre do catálogo.
- Módulo `apps/api/src/billing/`: controllers + services; Prisma só no service. Guards: JWT + `TRAINER` (401 visitante, 403 aluno).
- Contrato: `GET /billing/plans`, `POST /billing/orders` (`{ planCode }`), `GET /billing/orders/current`, `GET /billing/checkout-config` (public key para o formulário). Sem endpoint de cobrança de token nesta Issue.
- Front: `/treinador`, `/treinador/assinatura`, `/treinador/pagamento`; repositório `apps/web/repositories/billing.ts`; SDK `@mercadopago/sdk-react` só para montar o formulário (sem chamar cobrança).
- Pacotes: `mercadopago` na API (só se necessário para config; cobrança fica #26), `@mercadopago/sdk-react` no web — ambos já autorizados no `architecture.md`.
- Atualizar glossário/ER em `docs/architecture.md` com `amountCents` (e `planCode` na Subscription se faltar) no commit desta Issue.

## Tarefas

- [x] **Tarefa 1 — Modelar Pedido e Assinatura no Prisma**
  - Cobre: nenhum CA (passo técnico)
  - Teste primeiro: contrato Prisma declara `Order` e `Subscription` com os campos da spec; migration aplica; app sobe. Falha hoje: só existe `User`.
  - Arquivos previstos: `apps/api/src/prisma/contract.prisma`, migration, `docs/architecture.md` (glossário/ER)

- [x] **Tarefa 2 — Criar Pedido Pendente e abrir o formulário**
  - Cobre: CA1, CA5
  - Teste primeiro: e2e `POST /billing/orders` com treinador sem assinatura cria `PENDING` com `amountCents` do catálogo; `GET /billing/checkout-config` devolve public key. Vitest: confirmar em `/treinador/assinatura` chama o repositório e cai em `/treinador/pagamento` com o formulário; sair sem confirmar não chama `POST`. Falha hoje: não há billing nem rotas.
  - Arquivos previstos: `apps/api/src/billing/`, `apps/api/test/`, `apps/web/app/treinador/`, `apps/web/repositories/billing.ts`, `apps/web/__tests__/`

- [x] **Tarefa 3 — Recusar recontratar o mesmo plano ativo**
  - Cobre: CA2
  - Teste primeiro: e2e com `Subscription` ACTIVE (semeada no banco, `// TODO #26`) no mesmo `planCode` → `POST` não cria Pedido; resposta indica assinatura já ativa. Vitest: UI mostra que já está ativo.
  - Arquivos previstos: `apps/api/src/billing/`, `apps/api/test/`, `apps/web/app/treinador/assinatura/`, `apps/web/__tests__/`

- [x] **Tarefa 4 — Permitir plano diferente com assinatura ativa**
  - Cobre: CA3
  - Teste primeiro: e2e ACTIVE `MONTHLY` + `POST` `YEARLY` cria/atualiza `PENDING` com valor anual; `Subscription` continua `ACTIVE`. Vitest: fluxo vai a `/treinador/pagamento`.
  - Arquivos previstos: `apps/api/src/billing/`, `apps/api/test/`, `apps/web/__tests__/`

- [x] **Tarefa 5 — Reaproveitar Pedido Pendente ao trocar plano**
  - Cobre: CA4
  - Teste primeiro: e2e dois `POST` seguidos → uma linha `PENDING`; segundo atualiza `planCode`/`amountCents`. Contagem no banco = 1 Pendente.
  - Arquivos previstos: `apps/api/src/billing/`, `apps/api/test/`

- [x] **Tarefa 6 — Bloquear visitante e aluno**
  - Cobre: CA6, CA7
  - Teste primeiro: e2e sem Bearer → 401; JWT `STUDENT` → 403; zero Pedidos. Vitest: aluno não usa as telas de contratação de treinador.
  - Arquivos previstos: `apps/api/src/billing/`, `apps/api/test/`, `apps/web/__tests__/`

- [x] **Tarefa 7 — Recusar planCode inválido e preço do browser**
  - Cobre: CA8
  - Teste primeiro: e2e `planCode` inválido/ausente, body com `amountCents` ou preço → 400; Pendente inalterado ou inexistente; valor no banco nunca é o enviado pelo cliente.
  - Arquivos previstos: `apps/api/src/billing/`, `apps/api/test/`

- [ ] **Tarefa 8 — Recuperar Pendente após falha de rede na UI**
  - Cobre: CA9
  - Teste primeiro: e2e `GET /billing/orders/current` devolve o Pendente. Vitest: após `POST` ok e “rede” falha na navegação, reabrir contratação lê o current e segue ao formulário sem segundo `POST` desnecessário.
  - Arquivos previstos: `apps/api/src/billing/`, `apps/api/test/`, `apps/web/repositories/`, `apps/web/__tests__/`

- [ ] **Tarefa 9 — Formulário não marca Pedido como pago**
  - Cobre: CA10
  - Teste primeiro: e2e/Vitest — com formulário montado (ou página `/treinador/pagamento` aberta) o Pedido segue `PENDING`; Assinatura ACTIVE (se houver) não muda; não existe chamada de cobrança nesta Issue. Falha hoje: nada a proteger; o teste trava a regressão.
  - Arquivos previstos: `apps/web/app/treinador/pagamento/`, `apps/web/__tests__/`, `apps/api/test/`

## Critérios sem tarefa

-
