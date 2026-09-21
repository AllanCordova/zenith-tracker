---
issue: 3
status: aprovada
---

# US01 — Entrar no produto por papel

## O problema

Hoje o visitante não tem como existir no produto: sem conta, sem papel, sem sessão. Apps de kcal misturam cadastro com ficha antropométrica e deixam o aluno no mesmo sítio que o treinador. Sem uma porta por papel, o resto da consultoria (carteira, plano, teto) não tem quem a veja — e quem entra vê área que não é a dele.

## A história

**Como** visitante, **eu quero** criar conta e entrar com e-mail e senha escolhendo o papel (aluno ou treinador) **para que** eu caia só na área do meu papel.

## Critérios de aceite

Rotas da UI (português): `/cadastro`, `/login`, `/aluno`, `/treinador`. Contrato da API (envelope de `docs/architecture.md`): `POST /auth/register`, `POST /auth/login`, `GET /auth/me`. Corpo de escrita: `name`, `email`, `password`, e no cadastro `role` (`STUDENT` | `TRAINER`). Resposta de sucesso de cadastro/login em `data`: `accessToken` e `user` (`id`, `name`, `email`, `role`) — nunca `passwordHash`. JWT no `localStorage`, validade **24 horas**. Senha: mínimo 8 caracteres, ao menos uma letra `A–Z`/`a–z` e um dígito; confirmação só na tela de cadastro (a API recebe um único `password`). E-mail gravado em minúsculas; unicidade é essa forma normalizada (RN01). Papel escolhido no cadastro não muda depois (RN02). Logout é no cliente: apaga o JWT do `localStorage`.

- [ ] **CA1 — Dado** e-mail ainda não cadastrado, **quando** informo nome, e-mail, senha (com confirmação coincidente) e papel e confirmo, **então** a conta é criada, recebo JWT, o token fica no `localStorage` e eu entro já na área daquele papel (`/aluno` ou `/treinador`), vendo o meu nome. Aluno vê o estado vazio “plano ainda não fechado”. Treinador vê o estado vazio “carteira ainda não libera”.
- [ ] **CA2 — Dado** e-mail já cadastrado (mesmo com outra capitalização), **quando** tento criar de novo, **então** a conta não é criada e eu vejo que aquele e-mail já existe.
- [ ] **CA3 — Dado** conta existente, **quando** informo e-mail ou senha errados, **então** eu não entro, nenhum JWT é gravado, e eu vejo que a combinação não confere — sem dizer qual dos dois falhou.
- [ ] **CA4 — Dado** sessão de aluno, **quando** tento abrir `/treinador` (UI) ou uma rota de treinador na API, **então** continuo em `/aluno`; a API responde 403 sem vazar recurso.
- [ ] **CA5 — Dado** sessão de treinador, **quando** tento abrir `/aluno` (UI) ou uma rota de aluno na API, **então** continuo em `/treinador`; a API responde 403 sem vazar recurso.
- [ ] **CA6 — Dado** visitante sem JWT, **quando** abro `/aluno` ou `/treinador`, **então** vou para `/login` e não vejo nome, plano nem carteira.
- [ ] **CA7 — Dado** sessão válida, **quando** abro `/cadastro` ou `/login`, **então** caio na área do meu papel, sem criar outra conta.
- [ ] **CA8 — Dado** sessão válida, **quando** saio (logout), **então** o JWT some do `localStorage`, passo a ser visitante e uma área autenticada volta a exigir `/login`.
- [ ] **CA9 — Dado** cadastro com senha curta demais, sem letra, sem dígito, ou confirmação diferente, **quando** confirmo, **então** a conta não é criada. Confirmação divergente nem dispara a API; as outras recusas vêm da API (400).
- [ ] **CA10 — Dado** nome vazio, e-mail sem formato de e-mail, papel ausente/inválido, ou campo extra no body, **quando** submeto o cadastro, **então** a API responde 400, a conta não é criada, e eu vejo que os dados não passaram — sem stack e sem senha no corpo.
- [ ] **CA11 — Dado** formulário de cadastro preenchido mas ainda não confirmado com sucesso, **quando** fecho a aba, **então** nenhuma conta existe para aquele e-mail.
- [ ] **CA12 — Dado** tentativa de cadastro ou login, **quando** a rede falha no confirmar, **então** eu vejo que não deu certo, não entro como autenticado, e não vejo sucesso falso. Se a primeira tentativa na verdade gravou e eu tento de novo, vale o CA2.
- [ ] **CA13 — Dado** JWT expirado ainda no `localStorage`, **quando** abro uma área autenticada, **então** sou tratado como visitante: o token é descartado e vou para `/login`.

## Fora de escopo

- Login social, 2FA e recuperação de senha (non-goal do PRD).
- Troca de papel depois do cadastro.
- Refresh token, cookie httpOnly e revogação de JWT no servidor.
- Pedido, pagamento, vínculo, plano nutricional, teto do dia e medidor — além do texto-substituto das áreas.
- Editar nome, e-mail ou senha de conta já criada.

## Abandono no meio

Não há jornada desta história em `docs/user-flows.md` (a Jornada 1 assume o treinador já autenticado). Os buracos desta porta:

Fechar a aba no meio do cadastro não pode deixar conta pela metade: só o confirmar bem-sucedido grava `User`. Se a rede cair no clique, a tela não mente sucesso; o JWT não entra no `localStorage`; um retry que esbarre em e-mail já gravado reusa a mensagem do CA2, não inventa um segundo usuário. JWT no `localStorage` sobrevive a fechar a aba dentro das 24 h; passado isso, o produto trata a pessoa como visitante e joga o token fora — sessão expirada não é “aluno sem nome” nem área do treinador à mostra.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Não há plano vigente; o aluno vê só o substituto “plano ainda não fechado”, sem número inventado. No código: `// TODO #US04` até existir Issue da US04. | US04 (Issue ainda não criada) |
| Não há Assinatura nem carteira; o treinador vê só o substituto “carteira ainda não libera”, sem fluxo de pedido. No código: `// TODO #US05` até existir Issue da US05. | US05 (Issue ainda não criada) |

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
