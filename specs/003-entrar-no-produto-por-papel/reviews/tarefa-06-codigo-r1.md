# Parecer de Código — Tarefa 6

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- `apps/web/app/aluno/page.tsx` copia o mesmo gate (`useEffect` + `return null`) de `apps/web/app/treinador/page.tsx`, só invertendo o papel. A regra rota↔papel já está em `areaPathForRole`; o esqueleto do redirect ainda está duplicado. Quando CA6 (visitante → `/login`) entrar nas duas páginas, um layout/guard compartilhado evita os dois fluxos divergirem. Extrair agora, com só dois call sites e estados vazios diferentes, seria indireção cedo demais.
- `StudentAreaController` devolve `{}` no controller, sem service — espelho do `TrainerAreaController`. Para um stub de porta, um service só para retornar vazio seria abstração sem ganho. Quando a área do aluno passar a ter dado de domínio, a regra precisa sair do controller.

## Observações fora do escopo deste diff

- `StudentAreaController` e `TrainerAreaController` moram em `apps/api/src/auth/`, pasta que o `architecture.md` §3 reserva a JWT, strategies e guards. Candidata a Issue de manutenção: mover as rotas de área para o módulo de domínio quando ele existir.
- E2E desta sessão não chegou a exercitar o 403: Postgres em `127.0.0.1:5432` recusou conexão (mesmo sintoma nos testes pré-existentes da suíte). Vitest do `apps/web` não rodou de ponta a ponta no sandbox somente leitura (Vitest precisa gravar config temporária). Não é defeito do diff.
- `/aluno` ainda não manda visitante sem sessão para `/login` (CA6) — o gate novo só trata `TRAINER`.
