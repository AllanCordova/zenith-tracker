# 📄 Product Requirements Document (PRD)

**Projeto:** Zenith Tracker
**Versão:** 1.0.0
**Última atualização:** 2026-09-08

> 🤖 **Este documento é a fonte da verdade sobre o QUE o produto faz.** Regra de
> negócio que não estiver aqui não existe — nem para a equipe, nem para a IA.
> Tecnologia **não** se discute aqui: isso é assunto do `architecture.md`.

---

## 🎯 1. Visão Geral e Objetivo

**O problema:** Apps de kcal cravam o teto no cadastro — peso, altura, sexo e idade de um dia só. O número não acompanha a perda nem o ganho: ou o aluno fica redigitando o peso atual, ou a dieta mente. Quem treina força, cardio e esporte no mesmo ciclo ainda vê essa meta ignorar o dia real; um pico de fim de semana vira pânico e o aluno abandona. Do outro lado, o treinador atende a carteira no WhatsApp pessoal, sem ver quem precisa de atenção agora e sem um lugar onde a própria marca apareça.

**A solução:** O Zenith Tracker é o acompanhamento nutricional do treino híbrido. O treinador monta o setup inicial do aluno (antropometria, rotina, objetivo, revisão e margem). Depois disso o teto não espera o treinador de novo: varia com a perda ou o ganho conforme a dieta segue, sem o aluno definir o peso atual. O treinador pode editar dieta ou treino quando quiser — isso vira um setup novo, e o automático recomeça. O aluno gasta pouco tempo para saber se o dia fechou. O treinador paga uma assinatura para usar o painel com a carteira de alunos.

**Como saberemos que deu certo:** O aluno com plano vigente vê um teto que mudou sozinho com o andamento da dieta — não o mesmo número do setup, e sem o treinador ter autorizado aquele dia, e sem o aluno ter redigitado o peso. Ele consegue dizer se o dia fechou, sem planilha. O treinador com assinatura ativa conduz a carteira no produto (vínculo, setup, quem está na consultoria) e só entra de novo no número se decidir mudar dieta ou treino. Se o teto continua igual ao do cadastro enquanto o aluno já perdeu ou ganhou seguindo o plano, a solução não se diferenciou dos apps de kcal fixa.

---

## 📖 2. Glossário Ubíquo

> Os termos do negócio, como o cliente fala. É daqui que o `architecture.md`
> deriva os nomes das entidades.

| Termo | Significa | Não confundir com |
| :---- | :-------- | :---------------- |
| Aluno | Pessoa em consultoria que registra o dia e consulta o próprio plano | Visitante; Treinador |
| Treinador | Profissional que atende uma carteira de alunos e paga a assinatura do painel | Aluno; Visitante |
| Vínculo | Relação 1:N entre um treinador e os alunos da carteira dele | Conta do aluno (a conta existe antes; o vínculo é o que a coloca na carteira) |
| Plano nutricional | Setup vigente do vínculo (antropometria, rotina, objetivo, margem) a partir do qual o teto do dia é derivado | Meta do dia; Pedido; teto de um dia específico |
| Teto calórico | Quantidade de kcal do dia que o aluno deve perseguir. O treinador autoriza só no setup (inicial ou edição); depois o número muda sozinho com o andamento da dieta | Teto sugerido (saída bruta do motor, no momento do setup); margem de erro; meta do dia (ajuste por treino extra) |
| Motor | Cálculo que, no setup, cruza antropometria, rotina e objetivo e sugere teto e macros; depois disso recalcula o teto do dia automaticamente com a perda ou o ganho, sem o aluno redigitar peso e sem o treinador revisar cada dia | Teto do setup (o que o treinador viu na revisão); TMB de ficha estática |
| Margem de erro | Kcal extras, invisíveis ao aluno, que o treinador embute para não disparar alarme em deslize pequeno | Teto calórico (o aluno só vê o teto, nunca a margem) |
| Meta do dia | Teto do dia considerando o volume de treino daquela data | Teto do plano (número-base); gasto híbrido |
| Pedido | Intenção de pagar uma assinatura, com status (Pendente, Pago, Recusado, Expirado) | Assinatura; Pagamento |
| Pagamento | Tentativa ou confirmação financeira ligada a um pedido | Pedido (o pedido existe antes; o pagamento é o que o muda de estado) |
| Assinatura | Direito do treinador de usar o painel enquanto estiver Ativa | Pedido (a assinatura só nasce ou reativa quando o pedido fica Pago) |
| Medidor sincero | Indicador binário: o dia fechou ou não, cruzando ingestão e gasto | Gráfico de peso; badge |

---

## 👤 3. Atores e Permissões

> ⚠️ A coluna **"Não pode"** vira Guard e controle de role na API.

| Ator | Quem é | Pode | Não pode |
| :--- | :----- | :--- | :------- |
| Visitante | Pessoa sem sessão | Criar conta como aluno ou treinador; entrar com e-mail e senha | Ver plano, carteira, pedido ou qualquer dado de outra pessoa |
| Aluno | Conta autenticada no papel de aluno | Ver o próprio plano vigente e o teto do dia (sem margem e sem teto sugerido); registrar o próprio dia | Ver outros alunos; alterar o próprio teto; ver a margem de erro; criar pedido de assinatura |
| Treinador | Conta autenticada no papel de treinador | Contratar assinatura; com assinatura Ativa: vincular aluno, gravar o setup inicial, editar dieta ou treino quando quiser, ver a carteira | Ver carteira de outro treinador; alterar o papel da própria conta para aluno; ver a senha de ninguém |
| Gateway de pagamento | Serviço externo que cobra e notifica | Informar que um pagamento foi aprovado, recusado ou expirado | Liberar o painel por conta própria; criar vínculo ou plano |

---

## 📝 4. Escopo Funcional (User Stories)

> Uma story por vez. **Prioridade (MoSCoW)** e **tamanho (esforço)** são eixos
> independentes. O conjunto `Must Have` é o escopo comprometido deste semestre.
> Status: `⚪ Draft` · `🟡 Ready` · `🟢 Live`.

### US01 — Entrar no produto por papel · `Must Have` · `M` · Status: `🟡 Ready`

**Como** visitante, **eu quero** criar conta e entrar com e-mail e senha escolhendo o papel (aluno ou treinador) **para que** eu caia só na área do meu papel.

**Critérios de aceite:**

- [ ] **Dado** e-mail ainda não cadastrado, **quando** informo nome, e-mail, senha e papel e confirmo, **então** a conta é criada e eu entro já na área daquele papel.
- [ ] **Dado** e-mail já cadastrado, **quando** tento criar de novo, **então** a conta não é criada e eu vejo que aquele e-mail já existe.
- [ ] **Dado** conta existente, **quando** informo e-mail ou senha errados, **então** eu não entro e vejo que a combinação não confere — sem dizer qual dos dois falhou.
- [ ] **Dado** sessão de aluno, **quando** tento abrir a área do treinador, **então** continuo na área do aluno.

**Regras relacionadas:** RN01, RN02

---

### US02 — Vincular aluno à carteira · `Must Have` · `M` · Status: `⚪ Draft`

**Como** treinador com assinatura Ativa, **eu quero** colocar um aluno na minha carteira pelo e-mail da conta dele **para que** eu monte o plano daquela pessoa e não de outra.

**Critérios de aceite:**

- [ ] **Dado** assinatura Ativa e e-mail de um aluno já cadastrado que ainda não está na minha carteira, **quando** confirmo o vínculo, **então** o aluno passa a aparecer na carteira e o plano dele começa vazio.
- [ ] **Dado** e-mail que não é de um aluno, **quando** tento vincular, **então** o vínculo não é criado e eu vejo que só conta de aluno entra na carteira.
- [ ] **Dado** aluno já vinculado a mim, **quando** tento vincular de novo, **então** nada duplica e eu vejo que aquele aluno já está na carteira.
- [ ] **Dado** treinador sem assinatura Ativa, **quando** tento vincular, **então** o vínculo não é criado e eu sou levado a contratar a assinatura.

**Regras relacionadas:** RN03, RN04, RN16

---

### US03 — Montar o plano nutricional inicial · `Must Have` · `M` · Status: `⚪ Draft`

**Como** treinador com aluno vinculado, **eu quero** informar os dados iniciais, revisar o teto sugerido e gravar o setup com a margem **para que** o aluno passe a ver um teto que daí em diante se atualiza sozinho.

**Critérios de aceite:**

- [ ] **Dado** vínculo sem plano completo, **quando** informo idade, peso, altura, sexo biológico, esportes com frequência semanal e objetivo, **então** o motor preenche teto e macros sugeridos segundo RN05–RN10.
- [ ] **Dado** teto sugerido visível, **quando** aceito ou edito teto e macros e defino a margem de erro, **então** o plano fica vigente e o aluno passa a ver só o teto e os macros — nunca a margem nem o sugerido bruto.
- [ ] **Dado** plano já vigente, **quando** o aluno abre um dia posterior sem eu ter mexido no plano, **então** o teto daquele dia pode ter mudado sozinho — não depende de uma revisão nova minha.
- [ ] **Dado** plano já vigente, **quando** altero dieta ou treino e gravo, **então** isso vira um setup novo e o teto volta a ser recalculado automaticamente daí em diante.
- [ ] **Dado** passo ainda incompleto, **quando** tento pular a ordem antropometria → rotina → objetivo → revisão, **então** o plano não fica vigente.
- [ ] **Dado** treinador que não é dono daquele vínculo, **quando** tenta gravar o plano, **então** nada é alterado.

**Regras relacionadas:** RN05, RN06, RN07, RN08, RN09, RN10, RN11, RN12, RN20

---

### US04 — Consultar o teto calórico vigente · `Must Have` · `S` · Status: `⚪ Draft`

**Como** aluno com plano vigente, **eu quero** ver meu teto e meus macros **para que** eu saiba o número do dia sem abrir planilha.

**Critérios de aceite:**

- [ ] **Dado** plano vigente no meu vínculo, **quando** abro a área do aluno, **então** vejo o teto calórico e os macros do dia, sem margem de erro e sem teto sugerido.
- [ ] **Dado** plano vigente e andamento da dieta que já implica perda ou ganho, **quando** abro a área do aluno, **então** o teto do dia não é o do setup — apareceu sem o treinador autorizar aquele dia e sem eu informar o peso atual.
- [ ] **Dado** plano ainda não vigente, **quando** abro a área do aluno, **então** vejo que o treinador ainda não fechou o plano — e não vejo número inventado.
- [ ] **Dado** aluno A, **quando** existe plano do aluno B, **então** A não vê nada de B.

**Regras relacionadas:** RN11, RN12, RN20

---

### US05 — Contratar a assinatura do painel · `Must Have` · `M` · Status: `⚪ Draft`

**Como** treinador, **eu quero** escolher um plano pago e gerar um pedido **para que** eu possa ir ao checkout pagar o direito de usar a carteira.

**Critérios de aceite:**

- [ ] **Dado** treinador autenticado sem assinatura Ativa e sem pedido Pendente, **quando** escolho o plano e confirmo, **então** nasce um Pedido Pendente e eu sou enviado ao checkout externo.
- [ ] **Dado** treinador que já tem assinatura Ativa, **quando** tenta contratar de novo, **então** nenhum pedido novo é criado e eu vejo que a assinatura já está ativa.
- [ ] **Dado** pedido já Pendente, **quando** tento criar outro, **então** o sistema reaproveita o pedido aberto em vez de duplicar cobrança.
- [ ] **Dado** treinador que desiste antes de confirmar o plano, **quando** sai da tela, **então** nenhum Pedido é criado.

**Regras relacionadas:** RN13, RN14, RN16

---

### US06 — Confirmar o pagamento da assinatura · `Must Have` · `M` · Status: `⚪ Draft`

**Como** treinador, **eu quero** que a assinatura só vire Ativa quando o pagamento for confirmado pelo gateway **para que** fechar a aba no checkout não libere nem bloqueie o que eu já paguei.

**Critérios de aceite:**

- [ ] **Dado** Pedido Pendente, **quando** chega a notificação autenticada de pagamento aprovado, **então** o Pedido fica Pago, a Assinatura fica Ativa e o treinador passa a poder vincular aluno.
- [ ] **Dado** Pedido Pendente, **quando** o treinador volta da tela de retorno e a notificação ainda não chegou, **então** o Pedido continua Pendente e o painel não libera a carteira.
- [ ] **Dado** Pedido Pendente, **quando** a notificação informa recusa ou expiração, **então** o Pedido muda para Recusado ou Expirado, a assinatura não ativa, e o treinador pode gerar um novo pedido.
- [ ] **Dado** notificação que não passa na verificação, **quando** ela chega, **então** o Pedido não muda de estado.

**Regras relacionadas:** RN14, RN15, RN16

---

### US07 — Registrar refeição com pouco atrito · `Should Have` · `M` · Status: `⚪ Draft`

**Como** aluno, **eu quero** registrar o que comi com busca e sugestão do que eu já uso **para que** o dia inteiro não vire planilha.

**Critérios de aceite:**

- [ ] **Dado** plano vigente, **quando** busco um alimento ou refeição que já registrei, **então** ele aparece para eu repetir sem digitar tudo de novo.
- [ ] **Dado** busca sem resultado, **quando** não há sugestão, **então** eu consigo registrar na mão e isso fica disponível da próxima vez.
- [ ] **Dado** aluno sem plano vigente, **quando** tenta registrar, **então** vejo que o plano ainda não foi fechado e o registro não entra.

**Regras relacionadas:** RN11

---

### US08 — Ajustar o teto no dia de treino empilhado · `Should Have` · `M` · Status: `⚪ Draft`

**Como** aluno, **eu quero** que a meta do dia suba quando empilho treinos **para que** o número acompanhe o gasto real, não o papel do plano.

**Critérios de aceite:**

- [ ] **Dado** plano vigente e treinos registrados no dia acima do habitual da rotina, **quando** abro o dia, **então** a meta do dia fica maior que o teto-base, segundo RN17.
- [ ] **Dado** dia sem treino extra, **quando** abro o dia, **então** a meta do dia é o teto vigente, sem invenção.
- [ ] **Dado** aluno, **quando** a meta do dia ajusta, **então** eu vejo o número novo — a margem de erro continua invisível.

**Regras relacionadas:** RN11, RN17

---

### US09 — Ver se o dia fechou (medidor sincero) · `Should Have` · `S` · Status: `⚪ Draft`

**Como** aluno, **eu quero** um indicador binário cruzando ingestão e gasto **para que** eu saiba, sem gráfico ambíguo, se o dia fechou.

**Critérios de aceite:**

- [ ] **Dado** registros do dia, **quando** ingestão está dentro da faixa do teto (com margem só no cálculo, nunca na tela), **então** o medidor mostra que o dia fechou.
- [ ] **Dado** ingestão fora da faixa, **quando** abro o dia, **então** o medidor mostra que não fechou.
- [ ] **Dado** dia sem nenhum registro, **quando** abro o medidor, **então** ele mostra que ainda não há o que julgar — não marca como fechado.

**Regras relacionadas:** RN11, RN18

---

### US10 — Ver a carteira de alunos · `Should Have` · `M` · Status: `⚪ Draft`

**Como** treinador com assinatura Ativa, **eu quero** ver todos os meus alunos numa tela **para que** eu saiba quem está na consultoria sem caçar conversa.

**Critérios de aceite:**

- [ ] **Dado** pelo menos um vínculo meu, **quando** abro a carteira, **então** vejo nome e situação do plano de cada aluno meu.
- [ ] **Dado** carteira vazia, **quando** abro a tela, **então** vejo que ainda não há aluno — não uma lista inventada.
- [ ] **Dado** aluno de outro treinador, **quando** abro a minha carteira, **então** esse aluno não aparece.

**Regras relacionadas:** RN03, RN16

---

### US11 — Aplicar a marca no painel · `Should Have` · `M` · Status: `⚪ Draft`

**Como** treinador, **eu quero** colocar logomarca e cores da consultoria **para que** o aluno veja o meu serviço, não uma marca genérica.

**Critérios de aceite:**

- [ ] **Dado** assinatura Ativa, **quando** envio logomarca e escolho as cores, **então** a área do meu aluno passa a exibir essa identidade.
- [ ] **Dado** identidade ainda não configurada, **quando** o aluno entra, **então** ele vê a identidade padrão do Zenith — não um painel quebrado.
- [ ] **Dado** outro treinador, **quando** olha o aluno dele, **então** não vê a marca que eu configurei.

**Regras relacionadas:** RN16

---

### US12 — Conversar no canal interno · `Should Have` · `M` · Status: `⚪ Draft`

**Como** treinador ou aluno vinculados, **eu quero** trocar mensagem dentro do produto **para que** o atendimento saia do WhatsApp pessoal.

**Critérios de aceite:**

- [ ] **Dado** vínculo existente, **quando** um dos dois envia texto, **então** o outro vê a mensagem naquele vínculo.
- [ ] **Dado** pessoa sem vínculo entre si, **quando** tenta abrir conversa, **então** a conversa não existe.
- [ ] **Dado** conversa sem mensagens, **quando** abro o canal, **então** vejo vazio, não histórico de outro aluno.

**Regras relacionadas:** RN03

---

### US13 — Receber alerta de desvio · `Should Have` · `M` · Status: `⚪ Draft`

**Como** treinador, **eu quero** ser avisado quando o aluno sai da faixa de macros ou do teto **para que** eu saiba quando intervir.

**Critérios de aceite:**

- [ ] **Dado** aluno com registros fora da faixa (teto + margem), **quando** o dia fecha o período de apuração, **então** o treinador vê um alerta naquele aluno.
- [ ] **Dado** aluno dentro da faixa, **quando** olho a carteira, **então** aquele aluno não aparece como alerta.
- [ ] **Dado** aluno, **quando** o alerta existe, **então** ele não vê a margem que gerou o critério.

**Regras relacionadas:** RN11, RN18

---

### US14 — Acompanhar meta e badges · `Could Have` · `M` · Status: `⚪ Draft`

**Como** aluno, **eu quero** ver a meta final, o tempo faltante e badges de consistência **para que** eu não dependa só de culpa para continuar.

**Critérios de aceite:**

- [ ] **Dado** objetivo gravado no plano, **quando** abro o acompanhamento, **então** vejo a meta e quanto falta no prazo combinado com o treinador.
- [ ] **Dado** sequência de dias que fecharam, **quando** atinjo o critério de um badge, **então** o badge aparece na minha área.
- [ ] **Dado** semana sem nenhum dia fechado, **quando** abro badges, **então** não ganho badge daquela semana.

**Regras relacionadas:** RN08

---

### US15 — Disparar mensagem automática · `Could Have` · `M` · Status: `⚪ Draft`

**Como** treinador, **eu quero** configurar gatilho e texto no meu tom **para que** o aluno receba correção ou incentivo sem eu ficar na tela.

**Critérios de aceite:**

- [ ] **Dado** regra ativa (ex.: aluno não registrou o dia), **quando** a condição ocorre, **então** a mensagem configurada entra no canal daquele vínculo.
- [ ] **Dado** regra desligada, **quando** a condição ocorre, **então** nenhuma mensagem automática sai.
- [ ] **Dado** texto da regra, **quando** a mensagem é enviada, **então** o aluno vê o texto que o treinador escreveu, não um texto genérico do produto.

**Regras relacionadas:** RN03

---

### US16 — Suavizar o peso da semana · `Could Have` · `S` · Status: `⚪ Draft`

**Como** aluno, **eu quero** ver o peso da semana suavizado **para que** um domingo inchado não vire pânico.

**Critérios de aceite:**

- [ ] **Dado** vários registros de peso na semana, **quando** abro o acompanhamento, **então** vejo uma tendência suavizada, não só o último ponto.
- [ ] **Dado** um único peso na semana, **quando** abro o acompanhamento, **então** vejo esse ponto e a indicação de que ainda não há tendência.
- [ ] **Dado** nenhum peso, **quando** abro a tela, **então** vejo vazio, não um gráfico inventado.

**Regras relacionadas:** RN19

---

## 🛡️ 5. Regras de Negócio (Constraints)

| ID | Regra |
| :-- | :---- |
| RN01 | E-mail identifica a conta e é único no produto. |
| RN02 | O papel (aluno ou treinador) é escolhido no cadastro e não muda sozinho depois. Cada sessão vê só a área daquele papel. |
| RN03 | Um treinador tem muitos alunos (1:N). O vínculo é único por par treinador–aluno. O treinador não vincula a si mesmo. Só conta com papel de aluno entra como aluno da carteira. |
| RN04 | O plano nutricional pertence ao vínculo, não à conta solta. Sem vínculo, não há plano. |
| RN05 | TMB (Mifflin-St Jeor): `10 × peso(kg) + 6,25 × altura(cm) − 5 × idade + s`, com `s = +5` (masculino) ou `s = −161` (feminino). Resultado em kcal/dia, inteiro. |
| RN06 | PAL pela soma das frequências semanais de todos os esportes do plano: 0 → 1,2; 1–3 → 1,375; 4–6 → 1,55; 7–9 → 1,725; 10+ → 1,9. |
| RN07 | GET = TMB × PAL, inteiro. |
| RN08 | Teto sugerido: emagrecimento = GET × 0,80; hipertrofia = GET × 1,10; manutenção = GET. |
| RN09 | Macros sugeridos (gramas inteiras): proteína 2,0 g/kg (emagrecimento), 2,2 g/kg (hipertrofia) ou 1,6 g/kg (manutenção); gordura = 25% das kcal do teto (`kcal / 9`); carboidrato = restante (`(kcal − proteína×4 − gordura×9) / 4`, mínimo 0). |
| RN10 | Ordem do setup: antropometria → rotina → objetivo (dispara o motor) → revisão + margem. Não há teto vigente enquanto essa revisão não for gravada. Depois de gravado, o teto dos dias seguintes não exige nova revisão. |
| RN11 | O aluno nunca vê a margem de erro nem o teto sugerido bruto. A faixa “ainda ok” usada por alerta e medidor é teto do dia + margem. |
| RN12 | Só o treinador dono do vínculo grava o setup: antropometria, rotina, objetivo, margem e a revisão inicial (ou de uma edição). Ele pode editar dieta ou treino a qualquer momento; cada gravação é um setup novo. Ele não grava o teto de cada dia. |
| RN13 | Um Pedido pertence a um treinador e admite muitos Pagamentos (1:N). Não existem dois Pedidos Pendentes do mesmo treinador ao mesmo tempo. |
| RN14 | Quem decide que o Pedido foi Pago é a notificação autenticada do gateway, não a tela de retorno do checkout. |
| RN15 | Notificação que falha na verificação não altera Pedido nem Assinatura. |
| RN16 | Vincular aluno, montar plano e usar a carteira exigem Assinatura Ativa. Não há período de cortesia: o primeiro vínculo já cobra essa assinatura. Sem ela, o treinador só entra, vê o estado da assinatura e pode contratar. |
| RN17 | No dia em que o volume de treino registrado supera a rotina do plano, a meta do dia aumenta a partir do teto vigente. Sem treino extra, a meta do dia é o teto vigente. |
| RN18 | Alerta e medidor sincero usam a faixa teto vigente + margem. O aluno vê só o resultado (fechou / não fechou), nunca a margem. |
| RN19 | A tendência de peso da semana não substitui o registro bruto: o ponto do dia continua existindo; o que se suaviza é a leitura da semana. |
| RN20 | Depois de um setup gravado (o inicial ou uma edição), o teto do dia é recalculado automaticamente para o aluno com a perda ou o ganho da dieta — sem o aluno informar o peso atual e sem o treinador autorizar aquele dia. A fórmula do ajuste nasce na spec. Este princípio não se mistura com o aumento da meta do dia por treino extra (RN17). |

---

## 🚫 6. Fora de Escopo (Non-goals)

> O que o produto deliberadamente **não** faz neste semestre — o `Won't Have`
> do MoSCoW, com o motivo de cada corte.

- Aplicativo nativo (iOS/Android) — o semestre entrega a web; nativo infla o escopo sem mudar a regra de negócio.
- Login social, 2FA e recuperação de senha — autenticação é e-mail e senha para caber no prazo.
- Aluno pagando o treinador pelo produto — quem assina é o treinador; cobrança da consultoria continua fora.
- Integração com WhatsApp, e-mail em massa ou wearable — o canal do semestre é o interno (US12/US15).
- Marketplace de treinadores, troca de treinador pelo aluno e white label vendido à parte.
- Prescrição médica, exame laboratorial e diagnóstico — o produto acompanha plano nutricional da consultoria, não clínica.

---

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

> Só os que você consegue justificar na defesa.

- **Segredo:** senha, chave de gateway e dado de pagamento não aparecem em tela, log ou repositório.
- **Papel:** uma sessão de aluno jamais devolve dado de treinador, e o contrário também vale, inclusive em tentativa direta de endereço.
- **Pagamento em teste:** o fluxo de pedido e notificação roda em ambiente de testes do gateway; não há cobrança real neste semestre.
- **Rastreio:** cada Pedido guarda o histórico de Pagamentos o bastante para explicar na defesa por que ficou Pendente, Pago ou Recusado.
- **Atrito:** o registro de refeição (US07) precisa ser concluído em poucos campos — se a tela pedir uma ficha, a história falhou.

---

## 🛠️ 8. Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 2026-09-04 | 1.0.0 | Versão inicial: visão, glossário, atores, Must Have (US01–US06, com pedido e pagamento), Should/Could do backlog anterior, regras do motor e da assinatura |
| 2026-09-08 | 1.0.0 | Visão e RN20: teto variável com o andamento da dieta, sem o aluno redigitar o peso — distinto da meta do dia por treino extra (RN17) |
| 2026-09-08 | 1.0.0 | Setup vs. automático: treinador grava estado inicial (e pode editar quando quiser); o teto do dia aparece sozinho depois (RN10, RN12, RN20, US03, US04) |
| 2026-09-08 | 1.0.0 | RN16: sem período de cortesia — primeiro vínculo já exige Assinatura Ativa |
