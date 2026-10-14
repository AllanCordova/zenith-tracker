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

HTML estático em `prototype/`, publicado pelo GitHub Pages. Cores, raio e tipo vêm deste arquivo (Outfit, Fraunces e a paleta do diet). A entrada do visitante é o login da US01. US04, US05 e US06 continuam `Draft` e não têm tela aqui.

**Telas:**

1. Entrar — `login.html`. A combinação que não confere está em `login-erro.html`.
2. Cadastro — `cadastro.html`. E-mail já cadastrado está em `cadastro-erro.html`. Treinador segue para a carteira; aluno cai em `aluno.html` e, se tenta a área do treinador, continua lá.
3. Carteira de alunos — `wallet.html`. Plano nutricional abre o plano daquele aluno.
4. Dados pessoais — `nutritionalplane.html`. Idade, peso, altura e sexo biológico.
5. Rotina e atividade — `activty-plane.html`.
6. Revisão — `comfirm-plane.html`. Gravar o setup volta à carteira.

As telas 4, 5 e 6 são o mesmo plano. A casca fica; o passo no menu muda. Retornar à carteira volta para a lista. Prosseguir avança o passo.
