# 🎨 Tokens de Design

**Projeto:** Zenith Tracker
**Versão:** 1.1.0
**Última atualização:** 2026-09-21

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada
> tela.** Não é um design system — é o mínimo que dá à prototipagem assistida algo a
> que obedecer.

---

## Paleta

Nome semântico, nunca `azul-2` — a cor muda, o papel dela não. Os mesmos nomes
valem no claro e no escuro; o valor muda com a classe `dark` no `html`
(`next-themes`). No CSS, entram em `@theme` (`--color-primaria`, …).

A primária é verde de “no caminho”; perigo não se usa para alerta de meta —
alerta de desvio usa `perigo` só quando a ação é irreversível ou o pagamento
falhou. O medidor sincero usa `sucesso` / `texto-suave`, não um terceiro verde.

### Claro (padrão)

| Token | Valor | Onde se usa |
| --- | --- | --- |
| `primaria` | `#16a34a` | ação principal: contratar, gravar plano, entrar |
| `pagina` | `#fafafa` | fundo da viewport |
| `superficie` | `#ffffff` | fundo de card, painel e formulário |
| `texto` | `#0a0a0a` | texto padrão |
| `texto-suave` | `#71717a` | legenda, apoio, estado Pendente |
| `perigo` | `#dc2626` | erro, recusa de pagamento, exclusão |
| `sucesso` | `#15803d` | confirmação, Pedido Pago, dia fechou |
| `desabilitado` | `#d4d4d8` | controle inativo, botão que ainda não pode |

### Escuro (classe `dark`)

Os papéis não mudam. Superfície fica acima da página; texto claro sobre fundo
escuro. Primária, perigo e sucesso permanecem verdes/vermelhos de ação — não
viram cinza.

| Token | Valor | Onde se usa |
| --- | --- | --- |
| `primaria` | `#22c55e` | ação principal (um passo mais claro que no claro, para contrastar) |
| `pagina` | `#09090b` | fundo da viewport |
| `superficie` | `#18181b` | fundo de card, painel e formulário |
| `texto` | `#fafafa` | texto padrão |
| `texto-suave` | `#a1a1aa` | legenda, apoio, estado Pendente |
| `perigo` | `#f87171` | erro, recusa de pagamento, exclusão |
| `sucesso` | `#4ade80` | confirmação, Pedido Pago, dia fechou |
| `desabilitado` | `#3f3f46` | controle inativo, botão que ainda não pode |

## Escala de espaçamento

Uma progressão só, usada em tudo.

| Token | Valor |
| --- | --- |
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 40px |

Espaço interno de botão: `sm` vertical, `md` horizontal. Espaço entre campo e rótulo: `xs`. Entre blocos de uma jornada: `lg`. Margem da página: `xl`.

No CSS (`@theme`), estes valores entram como `--spacing-token-xs` … `--spacing-token-xl` (utilitários `p-token-md`). Sem o prefixo `token-`, o Token `md` (16px) sombrearia o `max-w-md` do Tailwind.

## Tipografia

| Token | Família · tamanho · peso | Papel |
| --- | --- | --- |
| `titulo` | Geist · 32px · 700 | nome da jornada, teto calórico em destaque |
| `subtitulo` | Geist · 20px · 600 | seção (plano, pedido, carteira) |
| `corpo` | Geist · 16px · 400 | texto corrido, critério, mensagem |
| `apoio` | Geist · 14px · 400 | legenda, status do Pedido, macro em gramas |
| `acao` | Geist · 16px · 600 | rótulo de botão |

Se Geist não estiver disponível no protótipo, Inter. Nunca misturar uma terceira família.

## Estados de botão

| Estado | Aparência |
| --- | --- |
| normal | fundo `primaria`, texto branco, cantos 8px, sem sombra |
| hover | mesmo fundo a 90% de opacidade; cursor de mão |
| foco (teclado) | anel de 2px `primaria` fora do botão, visível contra `superficie` |
| desabilitado | fundo `desabilitado`, texto `texto-suave`, sem hover, não clica |
| carregando | aparência de desabilitado + rótulo “Aguarde…”; não aceita segundo clique — é o que impede dois Pedidos no mesmo confirmar |

O botão de perigo (recusar, sair sem salvar) usa fundo `perigo` e os mesmos estados, trocando o anel de foco para `perigo`. Texto do botão de ação permanece branco nos dois temas.

## Protótipo

**Link:** pendência — ainda não há Figma/Stitch publicado.
**Telas:** as 5 da jornada de assinatura, quando o protótipo existir: (1) painel com assinatura inativa, (2) escolha do plano, (3) Pedido Pendente / saída para o checkout, (4) volta com pagamento ainda em aberto, (5) Assinatura Ativa e carteira liberada. Não prototipar telas que não estejam nessa jornada enquanto o link estiver pendente.
