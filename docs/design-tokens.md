# 🎨 Tokens de Design

**Projeto:** Zenith Tracker
**Versão:** 1.6.0
**Última atualização:** 2026-10-14

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada
> tela.** Não é um design system — é o mínimo que dá à prototipagem assistida algo a
> que obedecer.

---

## Paleta

Copiada do `diet` (`apps/client/src/styles.css`). Uma paleta só — o diet não define tema escuro. No CSS deste repo os nomes do diet entram em `@theme` e também alimentam os papéis que a interface já consome (`background`, `foreground`, `primary`, …).

| Token do diet | Valor | Papel neste repo | Onde se usa |
| --- | --- | --- | --- |
| `paper` | `#efeae2` | `background`, `surface-muted` | fundo da página; hover do item de menu; poço recolhido |
| `sheet` | `#f7f3ec` | `surface`, `primary-foreground` | card, campo, texto sobre ação e sobre item ativo |
| `ink` | `#1c1916` | `foreground` | texto; item de menu ativo; plano escolhido; marca |
| `muted` | `#6d655c` | `muted-foreground` | apoio, legenda, item de menu em repouso |
| `line` | `#e4dcd2` | `border`, `input` | traço de card, lista e campo |
| `copper` | `#c56a3a` | `primary`, `ring` | botão sólido; kicker; item ativo do dock; borda do campo em foco |
| `forest` | `#1e6b4a` | `success` | confirmação, dia fechou |
| `rose` | `#a33b32` | `danger` | erro, recusa, exclusão |

Faixa de erro é `rose` a 10% sobre `sheet`. Faixa de confirmação é `forest` a 10% sobre `sheet`. Não há token de aviso: o diet não tem.

O botão sólido não tem cor de hover própria — continua `copper`. Item de menu ativo é `ink` com texto `sheet`, não `copper`. A vitrine da entrada é `ink` com texto `sheet`.

## Raio

| Uso | Medida |
| --- | --- |
| campo, passo, item de menu | `1rem` (`rounded-2xl`; neste repo, `--radius` / `rounded-lg`) |
| linha da carteira | `1.4rem` |
| painel e card de plano | `1.6rem` |
| botão sólido | pill (`rounded-full`) |
| marca | `1rem` |

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

Outfit no corpo, rótulo e botão. Fraunces nos títulos e na marca. Pesos carregados: Outfit 400, 500 e 600; Fraunces 600 e 500 itálico. Não há família mono.

Tamanho é a escala do Tailwind.

| Papel | Classe |
| --- | --- |
| hero / vitrine | `font-serif text-5xl` |
| título de página | `font-serif text-4xl` |
| título de card | `font-serif text-3xl` |
| seção | `font-serif text-2xl` |
| corpo | `text-base` |
| apoio, botão, rótulo | `text-sm`; botão `font-medium` |
| kicker | `text-xs font-medium uppercase tracking-[0.16em] text-copper` |

## Estados de botão

| Estado | Aparência |
| --- | --- |
| normal | fundo `copper`, texto `sheet`, pill, `text-sm font-medium` |
| hover | a mesma cor; o diet não define outra |
| foco (teclado) | anel de 2px `copper`; no campo, a borda vira `copper` |
| desabilitado | opacidade 50%, não clica |
| carregando | aparência de desabilitado + rótulo “Aguarde…”; não aceita segundo clique |
| fantasma | fundo transparente, texto `ink` |
| linha | fundo `sheet`, traço `line`, texto `ink` |

O botão de perigo, quando a ação é irreversível ou o pagamento falhou, usa fundo `rose` e texto `sheet`. No formulário o botão sólido ocupa a largura do painel.

## Chrome

Header e footer no desktop ocupam a largura da viewport. Header: fundo `background` com traço `border` embaixo, altura `h-20`, blur. Footer: traço `border` em cima, tipografia de apoio — não replica o header.

Visitante: ícone de uma pessoa no header liga a `/login`. Sessão: o mesmo slot vira logout. Rodapé logado não mostra Cadastro nem Entrar. Na landing, o header ganha âncoras das seções.

## Protótipo

**Link:** https://allancordova.github.io/zenith-tracker/

HTML estático em `prototype/`, publicado pelo GitHub Pages. Cores, raio e tipo vêm deste arquivo (Outfit e Fraunces). A entrada é dividida. Com sessão, o desktop tem menu lateral e o celular tem dock. A entrada do visitante é o login da US01.

**Telas:**

1. Entrar — `login.html`. A combinação que não confere está em `login-erro.html`.
2. Cadastro — `cadastro.html`. E-mail já cadastrado está em `cadastro-erro.html`. Aluno cai em `aluno.html` e, se tenta a área do treinador, continua lá. Treinador cai no painel sem assinatura.
3. Painel bloqueado — `painel.html`. Sem Assinatura Ativa a carteira não abre e nenhum pedido existe.
4. Escolher o plano — `assinatura.html`. Sem assinatura, a tela diz que não há uma ativa e oferece Mensal e Anual. Confirmar abre o checkout. Sair sem confirmar não cria pedido.
5. Checkout do gateway — `checkout.html`. Pagar abre o retorno. Cancelar recusa o pedido. Fechar a aba reabre o painel com o pedido ainda Pendente.
6. Retorno — `retorno.html`. A notificação ainda não chegou: o pedido continua Pendente. Dali se simula aprovação ou recusa.
7. Pedido reaproveitado — `assinatura-reaproveita.html`.
8. Assinatura já ativa — `assinatura-ativa.html`. Mostra o plano vigente. Escolher de novo não cria pedido.
9. Carteira — `wallet.html`, só depois da notificação aprovada. Plano nutricional abre o plano daquele aluno.
10. Antropometria, rotina e revisão — `nutritionalplane.html`, `activty-plane.html`, `comfirm-plane.html`. Coluna de passos e painel. A rotina continua no meio, na ordem deste produto.

As telas 10 são o mesmo plano. A casca fica; o passo muda. Não há tela de alimento, treino, marca, conversa ou medidor: isso continua fora deste protótipo.
