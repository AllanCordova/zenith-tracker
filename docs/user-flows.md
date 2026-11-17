# 🗺️ Jornadas de Usuário

**Projeto:** Zenith Tracker
**Versão:** 1.1.0
**Última atualização:** 2026-11-16

> 🤖 **Este documento é a fonte da verdade sobre O QUE A PESSOA VIVE na tela** —
> o caminho do primeiro clique até o objetivo, e principalmente os pontos onde ela
> trava, espera ou desiste.
>
> 🚫 **Não duplique:** regra de negócio mora no `prd.md`; estado, entidade e contrato
> moram no `architecture.md`. Aqui mora o caminho.

---

## Jornada 1 — Contratar e confirmar a assinatura do painel

**Story:** US05, US06
**Critérios que ela marca:** depende do tempo · depende de outra pessoa · pode ser abandonada · formulário de pagamento no próprio produto

O treinador já tem conta (US01). Sem Assinatura Ativa ele entra no painel e vê que a carteira ainda não libera (RN16). Esta jornada é o caminho até o painel de verdade — e o ponto em que a maioria dos produtos mente para si mesma: tratar a tela de “obrigado” / status como se fosse pagamento.

O cartão é digitado no **formulário do Mercado Pago (Checkout Transparente)** embutido no produto. O SDK devolve um token; o servidor cobra com o valor do Pedido no banco. Quem confirma o pago é o webhook, não essa tela.

```mermaid
flowchart TD
    A(["Treinador autenticado abre o painel"]) --> B{"Assinatura Ativa?"}
    B -->|"sim, mesmo plano"| C["Usa a carteira — jornada encerrada"]
    B -->|"sim, escolhe plano diferente"| D["Escolhe o plano pago"]
    B -->|"não"| D
    D --> E{"Confirmou o plano?"}
    E -->|"não — desistiu na tela"| F["Nenhum Pedido criado"]
    E -->|"sim"| G["Pedido nasce Pendente no servidor"]
    G --> H["Formulário do MP no próprio site — token do cartão"]
    H --> I{"O que acontece na cobrança?"}
    I -->|"servidor cobra o token"| J["Gateway recebe a tentativa"]
    I -->|"cancela / recusa no formulário"| K["Pedido Recusado — pode gerar outro"]
    I -->|"fecha a aba / cai a rede / some"| X1[["Some no pagamento — e daí?"]]
    J --> L["Tela de status do pedido"]
    L --> M{"Notificação autenticada já chegou?"}
    X1 --> Q["Reabre o painel — a tela de status não abriu"]
    Q --> M
    M -->|"ainda não"| N["Pedido continua Pendente — carteira bloqueada"]
    N --> O["Espera a notificação — a tela de status não decide"]
    O --> M
    M -->|"sim, aprovado"| P["Pedido Pago · Assinatura Ativa · carteira libera"]
    M -->|"sim, recusado ou expirado"| K

    style X1 fill:#ffe0e0,stroke:#c62828
```

**O que decidimos sobre o nó vermelho:**

Se a pessoa fecha a aba no meio do pagamento, a tela de status nunca abre — e isso não pode significar nem “pago” nem “desistiu”. O Pedido já existe como Pendente desde antes do token ser cobrado; ele fica Pendente até a notificação autenticada do gateway chegar. Quem decide que foi pago é essa notificação, não o botão de voltar nem o “sucesso” do formulário. Quando a pessoa reabre o painel depois, o produto consulta o Pedido: se a notificação já tiver aprovado, a Assinatura está Ativa e a carteira libera; se ainda não chegou, mostra que o pagamento está em aberto e não inventa sucesso; se o gateway recusou ou deixou expirar, o Pedido fecha nesses estados e ela pode contratar de novo. Tratar a tela de status como fonte da verdade liberaria o painel para quem só chegou na página de “obrigado”, e travaria para quem já pagou mas fechou a aba — os dois erros que esta jornada existe para não cometer.
