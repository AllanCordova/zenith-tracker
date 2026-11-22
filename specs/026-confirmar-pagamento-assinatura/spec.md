---
issue: 26
status: rascunho
---

# US06 — Confirmar o pagamento da assinatura

## O problema

O treinador já consegue abrir o formulário do Mercado Pago e deixar um Pedido Pendente, mas digitar o cartão ainda não cobra nada e a Assinatura nunca vira Ativa pelo gateway. Sem a confirmação autenticada do pagamento, fechar a aba ou ver uma tela de “obrigado” poderia liberar ou travar a carteira à toa.

## A história

**Como** treinador, **eu quero** que a assinatura só vire Ativa quando o pagamento for confirmado pelo gateway **para que** fechar a aba no pagamento não libere nem bloqueie o que eu já paguei.

## Critérios de aceite

- [ ] **CA1 — Dado** Pedido `PENDING` e token de cartão válido do Checkout Transparente, **quando** o front envia o token à API e a API cobra no gateway (sandbox) com o `amountCents` do Pedido e chave de idempotência, **então** nasce um `Payment` ligado ao Pedido, o Pedido **permanece** `PENDING` até o webhook, e o treinador é levado à tela de status (sem liberar carteira).
- [ ] **CA2 — Dado** Pedido `PENDING`, **quando** chega notificação autenticada de pagamento **aprovado**, **então** o Pedido fica `PAID`, a Assinatura fica `ACTIVE` (nova linha se já havia outra Ativa no outro plano — a anterior vira `INACTIVE`), e o painel deixa de tratar o treinador como sem assinatura.
- [ ] **CA3 — Dado** Pedido `PENDING`, **quando** o treinador abre a tela de status e a notificação ainda não chegou, **então** a tela só **consulta** o Pedido (`PENDING`), não inventa sucesso, e a carteira não libera.
- [ ] **CA4 — Dado** Pedido `PENDING` e o treinador sumiu no pagamento (fechou a aba, caiu a rede ou a tela de status não abriu), **quando** reabre o painel, **então** o Pedido continua `PENDING`, a carteira não libera, e isso não conta como pago nem como desistência.
- [ ] **CA5 — Dado** Pedido `PENDING`, **quando** a notificação autenticada informa **recusa** ou **expiração**, **então** o Pedido vira `REFUSED` ou `EXPIRED`, nenhuma Assinatura nova fica `ACTIVE` por causa desse Pedido, e o treinador pode gerar um novo Pedido (fluxo da US05).
- [ ] **CA6 — Dado** notificação que **não** passa na verificação da assinatura (`PAGAMENTO_WEBHOOK_SECRET`), **quando** ela chega, **então** a API responde sem aplicar efeito e o Pedido/Assinatura não mudam (RN15).
- [ ] **CA7 — Dado** notificação **repetida** (mesmo pagamento já processado) ou Pedido já terminal (`PAID`/`REFUSED`/`EXPIRED`), **quando** o webhook chega de novo, **então** não altera de novo Pedido nem Assinatura (idempotência).
- [ ] **CA8 — Dado** valor ou status vindo do browser na cobrança, **quando** a API cobra, **então** o valor efetivo é sempre o `amountCents` do Pedido no banco; campos extras de preço no body são rejeitados.

## Fora de escopo

- Vincular aluno / carteira completa (US02) — aqui “carteira libera” = Assinatura `ACTIVE` e o painel do treinador deixa de empurrar só para contratação.
- Produção real do Mercado Pago (só sandbox).
- PIX, boleto ou meios além do cartão no Checkout Transparente.
- Estorno, chargeback, renovação automática recorrente do gateway.
- Alterar o fluxo da US05 de criar/reaproveitar Pedido Pendente (já na `main`).

## Abandono no meio

Nó vermelho da Jornada 1 (`docs/user-flows.md`): fechar a aba / cair a rede / sumir depois de tentar pagar **não** decide pago nem desistência. O Pedido já é `PENDING` antes da cobrança; só a notificação autenticada move para `PAID` / `REFUSED` / `EXPIRED`. A tela de status e o painel **consultam** o Pedido — não confirmam pagamento. Cancelar ou errar no formulário do SDK **não** marca `REFUSED` sozinho: quem informa recusa/expiração é o webhook.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Vínculo real de aluno e uso da carteira (US02) ainda não existem; “liberar” nesta história = Assinatura `ACTIVE` | #12 / US02 |

## Depende de

- #25 (US05) — Pedido Pendente, formulário MP e catálogo na `main`

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
