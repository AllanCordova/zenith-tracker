# Parecer de Conformidade — Tarefa 6

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — cadastro cria conta, JWT e cai na área do papel | fora desta tarefa | — |
| CA2 — e-mail já cadastrado recusa nova conta | fora desta tarefa | — |
| CA3 — login errado não entra e não grava JWT | fora desta tarefa | — |
| CA4 — aluno não entra na área do treinador | fora desta tarefa | — |
| CA5 — sessão de treinador em `/aluno` ou rota de aluno na API: permanece em `/treinador`; API 403 sem vazar recurso | atendido | `apps/web/app/aluno/page.tsx:12-20`; `apps/api/src/auth/student-area.controller.ts:6-12`; `apps/web/__tests__/aluno.test.tsx:20-33`; `apps/api/test/auth.e2e-spec.ts:265-292` |
| CA6 — visitante sem JWT vai para `/login` | fora desta tarefa | — |
| CA7 — sessão válida em `/cadastro` ou `/login` cai na área do papel | fora desta tarefa | — |
| CA8 — logout apaga JWT e volta a exigir `/login` | fora desta tarefa | — |
| CA9 — senha inválida ou confirmação divergente | fora desta tarefa | — |
| CA10 — nome/e-mail/papel inválidos ou campo extra → 400 | fora desta tarefa | — |
| CA11 — fechar aba antes de confirmar não cria conta | fora desta tarefa | — |
| CA12 — falha de rede no confirmar não finge sucesso | fora desta tarefa | — |
| CA13 — JWT expirado tratado como visitante | fora desta tarefa | — |

## Apontamentos
