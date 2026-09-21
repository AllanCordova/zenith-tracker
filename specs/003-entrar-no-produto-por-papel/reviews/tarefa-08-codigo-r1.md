# Parecer de Código — Tarefa 8

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- O gate “já autenticado → `areaPathForRole`” está copiado em `apps/web/app/cadastro/page.tsx:20-28` e `apps/web/app/login/page.tsx:17-25`. A regra de sessão já é única em `lib/session.ts`; o esqueleto do redirect ainda não. Quando CA13 (JWT expirado) entrar, os dois fluxos podem divergir se só uma página passar a descartar o token.
- `onLogout` (`clearSession` + `router.push("/login")` + botão “Sair”) está copiado em `apps/web/app/aluno/page.tsx:27-39` e `apps/web/app/treinador/page.tsx:27-39`. A regra de apagar o JWT já está em `clearSession`; o handler de UI ainda não. Extrair agora, com só dois call sites, seria indireção cedo demais.
- `getAccessToken()` / `getSessionUser()` rodam no render de `/cadastro` e `/login`. No SSR `window` não existe, então autenticado hidrata do formulário para `null`. Ler a sessão depois do mount evita o mismatch; o mesmo padrão já foi apontado nas áreas autenticadas.
- Em `apps/web/__tests__/login.test.tsx:17-21` o mock de `@/repositories/auth` exporta `register`, que `LoginPage` não importa. `expect(register).not.toHaveBeenCalled()` fica verdadeiro à toa. O que cobre CA7 nessa tela é o `login` não disparar e o `push` da área.

## Observações fora do escopo deste diff

- Token expirado ainda no `localStorage` continua passando no `if (token)` (CA13).
- `StudentAreaController` / `TrainerAreaController` seguem em `apps/api/src/auth/`, pasta que o `architecture.md` §3 reserva a JWT, strategies e guards.
- Vitest neste sandbox não isolou `apps/web` nem resolveu `@/` (`npx vitest run` subiu a suíte da raiz; `./node_modules/.bin/vitest` não existe neste checkout). Mesmo sintoma das tarefas 3–5; não é defeito do diff.
