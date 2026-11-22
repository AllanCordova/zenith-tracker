---
issue: 25
status: aprovada
---

# US05 — Contratar a assinatura do painel

## O problema

Sem assinatura Ativa o treinador já entra no painel, mas a carteira não libera (RN16). Hoje não há como nascer um Pedido nem abrir o pagamento no próprio produto: ou a pessoa fica bloqueada para sempre, ou alguém inventaria “pago” na tela. Sem Pedido Pendente com valor no servidor, não existe base segura para o Checkout Transparente nem para o webhook da história seguinte.

## A história

**Como** treinador, **eu quero** escolher um plano pago e gerar um pedido **para que** eu possa ir ao checkout pagar o direito de usar a carteira.

## Critérios de aceite

Rotas da UI (português): `/treinador` (painel; sem assinatura Ativa mostra que a carteira ainda não libera e oferece contratar), `/treinador/assinatura` (escolher plano), `/treinador/pagamento` (formulário do Mercado Pago / Checkout Transparente após Pedido Pendente). Contrato da API (envelope de `docs/architecture.md`): `GET /billing/plans`, `POST /billing/orders`, `GET /billing/orders/current`, `GET /billing/checkout-config`. Só `TRAINER` autenticado. Visitante sem JWT → **401**. Aluno com JWT → **403**, sem criar Pedido e sem vazar recurso.

Catálogo no **servidor** (nunca preço vindo do browser): `MONTHLY` = **4990** centavos (R$ 49,90); `YEARLY` = **39900** centavos (R$ 399,00). O Pedido (`Order`) grava `planCode`, `amountCents` (congelado na criação ou na atualização do Pendente), `status` `PENDING`, `trainerId`. Um treinador tem no máximo **um** Pedido `PENDING` (RN13).

Confirmar o plano na UI chama `POST /billing/orders` com `{ planCode }` apenas. A API define o valor. Cobrar o token do cartão e o webhook **não** fazem parte desta Issue (são a #26).

- [ ] **CA1 — Dado** treinador autenticado sem assinatura Ativa e sem Pedido Pendente, **quando** escolho `MONTHLY` ou `YEARLY` e confirmo, **então** nasce um Pedido `PENDING` com `planCode` e `amountCents` do catálogo do servidor, e eu vejo `/treinador/pagamento` com o formulário do Mercado Pago (Checkout Transparente) no próprio produto, usando a public key exposta só para treinador.
- [ ] **CA2 — Dado** treinador com assinatura Ativa no plano atual (ex.: `MONTHLY`), **quando** escolho de novo esse mesmo `planCode`, **então** nenhum Pedido novo é criado, o Pendente (se houver) não muda, e eu vejo que a assinatura já está ativa naquele plano.
- [ ] **CA3 — Dado** treinador com assinatura Ativa no plano atual, **quando** escolho um `planCode` diferente e confirmo, **então** nasce um Pedido `PENDING` com o novo `planCode`/`amountCents`, eu sigo o fluxo comum até `/treinador/pagamento`, e a Assinatura **atual permanece Ativa** (a carteira continua liberada) até um pagamento futuro confirmar o novo plano (#26).
- [ ] **CA4 — Dado** Pedido já `PENDING` (qualquer `planCode`), **quando** confirmo de novo o mesmo ou outro plano do catálogo, **então** o sistema **reaproveita** esse Pedido: atualiza `planCode` e `amountCents` para o escolhido, não cria segunda linha `PENDING`, e eu sigo para `/treinador/pagamento`.
- [ ] **CA5 — Dado** treinador na tela de escolher plano ainda **sem** ter confirmado com sucesso, **quando** saio da tela (volto ao painel ou fecho o fluxo), **então** nenhum Pedido é criado.
- [ ] **CA6 — Dado** visitante sem JWT, **quando** chamo `POST /billing/orders` (ou as outras rotas de billing), **então** a API responde **401**, nenhum Pedido nasce.
- [ ] **CA7 — Dado** sessão de aluno (`STUDENT`), **quando** chamo as rotas de billing ou abro `/treinador/assinatura` / `/treinador/pagamento`, **então** a API responde **403** sem criar Pedido; na UI continuo fora da área de contratação de treinador (mesmo padrão da US01).
- [ ] **CA8 — Dado** `POST /billing/orders` com `planCode` ausente, inválido, ou com `amountCents`/preço enviado pelo cliente, **quando** submeto, **então** a API responde **400**, não cria Pedido (ou não altera o Pendente), e o valor efetivo nunca é o que o browser mandou.
- [ ] **CA9 — Dado** Pedido Pendente acabou de ser criado ou reaproveitado e a rede falhou depois do sucesso do `POST` mas antes de eu ver o formulário, **quando** abro de novo a contratação, **então** `GET /billing/orders/current` devolve esse Pendente (não duplica) e eu posso seguir para o formulário.
- [ ] **CA10 — Dado** formulário de pagamento visível, **quando** apenas visualizo ou fecho a aba **sem** a Issue #26 ter cobrado o token, **então** o Pedido permanece `PENDING`, a Assinatura Ativa (se existia) não muda, e a carteira não “vira paga” por causa desta tela.

## Fora de escopo

- Cobrar o token do cartão no gateway, chave de idempotência da cobrança e qualquer chamada `Payment` ao Mercado Pago.
- Webhook, verificação de assinatura da notificação, mudança para `PAID` / `REFUSED` / `EXPIRED`, criar ou trocar Assinatura Ativa pelo pagamento novo (#26).
- Vincular aluno, carteira com alunos, plano nutricional, teto do dia.
- Checkout Pro / redirecionamento para o site hospedado do Mercado Pago.
- Cancelamento explícito de Assinatura Ativa pelo treinador, cupom, trial, meio além de cartão sandbox.
- Persistência do número do cartão ou do CVV em qualquer camada nossa.

## Abandono no meio

Jornada 1 em `docs/user-flows.md`: o nó vermelho de “sumir no pagamento” e a confirmação via webhook são da **#26**. Nesta história o abandono relevante é **antes** do Pedido existir e **depois** dele existir sem cobrança.

Sair de `/treinador/assinatura` sem confirmar não cria Pedido (CA5). Se o `POST` gravou o Pendente e a aba caiu antes do formulário, reabrir reusa o Pendente (CA4/CA9) — não inventa segundo Pendente (RN13). Ver o formulário ou fechar a aba nele **não** marca pago (CA10; RN14): quem decide pago é a notificação na #26. Trocar de plano com Assinatura Ativa cria/atualiza Pendente sem derrubar a Assinatura vigente (CA3).

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Cobrar o token, gravar `Payment`, webhook autenticado e ativar/trocar Assinatura pelo Pedido Pago ainda não existem; o formulário nesta Issue só prepara o checkout. No código: `// TODO #26`. | #26 |
| Carteira com alunos e vínculo ainda não existem; com Assinatura Ativa o painel pode mostrar o estado liberado sem lista real de alunos. No código: `// TODO #12`. | #12 |

## Depende de

- #3 (US01 — conta, JWT, papel `TRAINER`)

## Dúvidas em aberto

Nenhuma.
