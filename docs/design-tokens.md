# 🎨 Tokens de Design

**Projeto:** Zenith Tracker
**Versão:** 1.5.0
**Última atualização:** 2026-10-14

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada
> tela.** Não é um design system — é o mínimo que dá à prototipagem assistida algo a
> que obedecer.

---

## Paleta

Nome semântico, nunca `azul-2` — a cor muda, o papel dela não. Os mesmos nomes
valem no claro e no escuro; o valor muda com a classe `dark` no `html`
(`next-themes`). No CSS, entram em `@theme` (`--color-background`, …).

O tema é preto e branco. Ação principal é o próprio texto invertido: preto no
claro, branco no escuro. Perigo não se usa para alerta de meta — alerta de
desvio usa `danger` só quando a ação é irreversível ou o pagamento falhou. O
medidor sincero usa `success` / `muted-foreground`.

`border` é traço estrutural. Campo usa `input`. Foco usa `ring`.

### Claro (padrão)

| Token | Valor | Onde se usa |
| --- | --- | --- |
| `background` | `#ffffff` | fundo da viewport |
| `foreground` | `#0a0a0a` | texto padrão |
| `surface` | `#ffffff` | fundo de card sobre o fundo, quando precisa separar |
| `surface-muted` | `#f4f4f5` | painel, formulário, faixa, hover de ícone |
| `border` | `#e4e4e7` | traço de header, footer, lista |
| `input` | `#d4d4d8` | borda de campo |
| `ring` | `#0a0a0a` | anel de foco |
| `primary` | `#0a0a0a` | ação principal |
| `primary-foreground` | `#fafafa` | texto sobre `primary` |
| `primary-hover` | `#262626` | hover da ação principal |
| `muted-foreground` | `#71717a` | legenda, apoio, estado Pendente |
| `danger` | `#dc2626` | erro, recusa de pagamento, exclusão |
| `danger-foreground` | `#fafafa` | texto sobre `danger` |
| `danger-surface` | `#fef2f2` | faixa de erro |
| `success` | `#16a34a` | confirmação, Pedido Pago, dia fechou |
| `success-foreground` | `#fafafa` | texto sobre `success` |
| `success-surface` | `#f0fdf4` | faixa de confirmação |
| `warning` | `#d97706` | aviso |
| `warning-surface` | `#fffbeb` | faixa de aviso |

### Escuro (classe `dark`)

Os papéis não mudam. Superfície fica acima da página; texto claro sobre fundo
escuro. A primária inverte: fundo claro, texto escuro.

| Token | Valor | Onde se usa |
| --- | --- | --- |
| `background` | `#0a0a0a` | fundo da viewport |
| `foreground` | `#fafafa` | texto padrão |
| `surface` | `#111113` | card |
| `surface-muted` | `#1c1c1f` | painel, formulário, faixa |
| `border` | `#27272a` | traço de header, footer, lista |
| `input` | `#3f3f46` | borda de campo |
| `ring` | `#fafafa` | anel de foco |
| `primary` | `#fafafa` | ação principal |
| `primary-foreground` | `#0a0a0a` | texto sobre `primary` |
| `primary-hover` | `#e4e4e7` | hover da ação principal |
| `muted-foreground` | `#a1a1aa` | legenda, apoio |
| `danger` | `#ef4444` | erro, recusa, exclusão |
| `danger-foreground` | `#fafafa` | texto sobre `danger` |
| `danger-surface` | `#1f1315` | faixa de erro |
| `success` | `#22c55e` | confirmação, dia fechou |
| `success-foreground` | `#04210f` | texto sobre `success` |
| `success-surface` | `#0c1f14` | faixa de confirmação |
| `warning` | `#f59e0b` | aviso |
| `warning-surface` | `#201803` | faixa de aviso |

Controle desabilitado: fundo `surface-muted`, texto `muted-foreground`. Não há token à parte.

## Raio

Um só: `0.625rem`, o `rounded-lg` do Tailwind (`--radius-lg`). Cantos vivos (0) são defeito. Ícone do header usa `rounded-full`.

## Espaçamento

A escala do Tailwind. Não há `--spacing-token-*` nem utilitário `p-token-*`.

| Uso | Classe |
| --- | --- |
| entre rótulo e campo, erro de campo | `mt-1` / `mb-1` |
| entre campos, apoio | `mt-2` / `gap-2` |
| padding de campo e de botão | `px-4` `py-3` / `px-6` `py-3` |
| entre blocos | `gap-6` / `mt-6` |
| margem de página | `px-4` `py-8`; no desktop, `md:px-8` `md:py-16` ou `md:py-24` |
| faixa larga da landing | `py-10` |

## Tipografia

Geist no texto. Geist Mono no kicker e no número de passo. Terceira família é defeito.

Tamanho é a escala do Tailwind, não um token de tipo à parte.

| Papel | Classe |
| --- | --- |
| hero | `text-5xl font-bold tracking-tight` |
| título de jornada | `text-4xl font-bold tracking-tight` |
| seção | `text-xl font-semibold` ou `text-3xl font-bold` |
| corpo | `text-base` |
| apoio, botão, rótulo | `text-sm`; rótulo e botão `font-semibold` |
| kicker | `font-mono text-xs font-semibold uppercase tracking-widest` |

## Estados de botão

| Estado | Aparência |
| --- | --- |
| normal | fundo `primary`, texto `primary-foreground`, `rounded-lg`, sem sombra |
| hover | fundo `primary-hover` |
| foco (teclado) | anel de 2px `ring` |
| desabilitado | fundo `surface-muted`, texto `muted-foreground`, sem hover, não clica |
| carregando | aparência de desabilitado + rótulo “Aguarde…”; não aceita segundo clique |

O botão de perigo usa fundo `danger` e texto `danger-foreground`. No formulário o botão ocupa a largura do painel.

## Chrome

Header e footer no desktop ocupam a largura da viewport. Header: fundo `background` com traço `border` embaixo, altura `h-20`, blur. Footer: traço `border` em cima, tipografia de apoio — não replica o header.

Visitante: ícone de uma pessoa no header liga a `/login`. Sessão: o mesmo slot vira logout. Rodapé logado não mostra Cadastro nem Entrar. Na landing, o header ganha âncoras das seções.

## Protótipo

**Link:** https://allancordova.github.io/zenith-tracker/

HTML estático em `prototype/`, publicado pelo GitHub Pages. Cores, raio e tipo vêm deste arquivo (Geist, preto e branco). A entrada do visitante é o login da US01. US04, US05 e US06 continuam `Draft` e não têm tela aqui.

**Telas:**

1. Entrar — `login.html`. A combinação que não confere está em `login-erro.html`.
2. Cadastro — `cadastro.html`. E-mail já cadastrado está em `cadastro-erro.html`. Treinador segue para a carteira; aluno cai em `aluno.html` e, se tenta a área do treinador, continua lá.
3. Carteira de alunos — `wallet.html`. Plano nutricional abre o plano daquele aluno.
4. Dados pessoais — `nutritionalplane.html`. Idade, peso, altura e sexo biológico.
5. Rotina e atividade — `activty-plane.html`.
6. Revisão — `comfirm-plane.html`. Gravar o setup volta à carteira.

As telas 4, 5 e 6 são o mesmo plano. A casca fica; o passo no menu muda. Retornar à carteira volta para a lista. Prosseguir avança o passo.
