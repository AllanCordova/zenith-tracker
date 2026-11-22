# Plano — Issue #26

## Decisões técnicas

- Entidade nova: `Payment` (`id`, `orderId`, `gatewayPaymentId`, `status`, `receivedAt`) — 1:N com `Order` (RN13). Migration + glossário/ER já previstos na architecture.
- Módulo `apps/api/src/payments/`: cobrança do token (JWT+TRAINER) e webhook público. Prisma só no service. SDK `mercadopago` na API (já autorizado).
- Contrato: `POST /billing/orders/:orderId/charge` (ou `/payments/charge`) com `{ token }` — valor sempre do Pedido no banco; chave de idempotência; cria `Payment`; **não** muda `Order` para `PAID`. Webhook `POST /payments/webhook` (público) verifica `PAGAMENTO_WEBHOOK_SECRET`; só ele move `Order` → `PAID`/`REFUSED`/`EXPIRED` e cria/atualiza `Subscription`.
- Troca de plano paga: nova linha `Subscription` `ACTIVE`; a `ACTIVE` anterior (se houver) vira `INACTIVE`.
- Front: `onSubmit` do `CardPayment` envia token; rota `/treinador/pagamento/status` só consulta Pedido/Assinatura (sem decidir pago). Painel do treinador reflete `ACTIVE` vs contratação.
- E2e: mock/stub do gateway na cobrança; webhook com payload assinado fake (sem ngrok).

## Tarefas

- [x] **Tarefa 1 — Modelar Pagamento no Prisma**
  - Cobre: nenhum CA (passo técnico)
  - Teste primeiro: contrato Prisma declara `Payment` com os campos da architecture; migration aplica; app sobe. Falha hoje: só `Order`/`Subscription`.
  - Arquivos previstos: `apps/api/src/prisma/contract.prisma`, migration, `docs/architecture.md` (se faltar detalhe)

- [x] **Tarefa 2 — Cobrar o token sem marcar Pedido como pago**
  - Cobre: CA1, CA8
  - Teste primeiro: e2e `POST` charge com token + Pedido `PENDING` cria `Payment`, Pedido segue `PENDING`, valor cobrado = `amountCents` do banco; body com preço/`amountCents` → 400. Vitest: `onSubmit` chama charge e navega para `/treinador/pagamento/status`.
  - Arquivos previstos: `apps/api/src/payments/`, `apps/api/test/`, `apps/web/app/treinador/pagamento/`, `apps/web/repositories/`, `apps/web/__tests__/`

- [x] **Tarefa 3 — Webhook aprovado ativa Assinatura**
  - Cobre: CA2
  - Teste primeiro: e2e webhook autenticado “aprovado” → `Order` `PAID`, nova `Subscription` `ACTIVE` (e ACTIVE anterior `INACTIVE` se troca de plano); painel/consulta deixa de tratar como sem assinatura.
  - Arquivos previstos: `apps/api/src/payments/`, `apps/api/test/`, `apps/web/` (painel/status se necessário)

- [x] **Tarefa 4 — Tela de status só consulta Pendente**
  - Cobre: CA3
  - Teste primeiro: Vitest/e2e — com Pedido `PENDING` e sem webhook, `/treinador/pagamento/status` mostra Pendente e não libera carteira; nenhum `POST` de “confirmar pago”.
  - Arquivos previstos: `apps/web/app/treinador/pagamento/status/`, `apps/web/__tests__/`, repositório de consulta

- [x] **Tarefa 5 — Abandono no pagamento não decide pago**
  - Cobre: CA4
  - Teste primeiro: e2e/Vitest — após charge (ou mesmo só Pendente), “sumir” e reabrir painel: Pedido `PENDING`, carteira bloqueada, sem Assinatura nova.
  - Arquivos previstos: `apps/web/app/treinador/`, `apps/web/__tests__/`, `apps/api/test/`

- [x] **Tarefa 6 — Webhook de recusa ou expiração**
  - Cobre: CA5
  - Teste primeiro: e2e notificação autenticada recusada/expirada → `Order` `REFUSED`/`EXPIRED`; nenhuma `Subscription` `ACTIVE` nova; treinador pode criar novo Pedido (US05).
  - Arquivos previstos: `apps/api/src/payments/`, `apps/api/test/`

- [x] **Tarefa 7 — Rejeitar webhook sem assinatura válida**
  - Cobre: CA6
  - Teste primeiro: e2e payload sem/`PAGAMENTO_WEBHOOK_SECRET` errado → Pedido e Assinatura inalterados.
  - Arquivos previstos: `apps/api/src/payments/`, `apps/api/test/`

- [x] **Tarefa 8 — Webhook idempotente**
  - Cobre: CA7
  - Teste primeiro: e2e segundo webhook do mesmo pagamento (ou Pedido já terminal) não altera de novo `Order`/`Subscription`.
  - Arquivos previstos: `apps/api/src/payments/`, `apps/api/test/`

## Critérios sem tarefa

-
