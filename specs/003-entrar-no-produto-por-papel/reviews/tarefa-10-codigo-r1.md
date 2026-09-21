# Parecer de Código — Tarefa 10

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- `jwtExpirado()` está copiado em `apps/web/__tests__/aluno.test.tsx` e `apps/web/__tests__/treinador.test.tsx`. Não é regra de domínio; extrair só se nascer um terceiro caso.
- `isAccessTokenExpired` em `apps/web/lib/session.ts` falha aberto: token que não tem 3 partes, sem `exp` numérico, ou cujo payload não decodifica, continua válido. O caso da tarefa (JWT com `exp` no passado) está coberto; token corrompido ainda autenticaria na UI até a API recusar.
- A expiração só entra em `getAccessToken()`. `getSessionUser()` ainda lê o `user` do `localStorage` sem olhar o token. Hoje as páginas chamam o token primeiro (e o clear limpa os dois), mas a ordem é frágil.

## Observações fora do escopo deste diff

- Cadastro já trata falha de rede (`apps/web/app/cadastro/page.tsx` + teste em `cadastro.test.tsx`); por isso esses arquivos não aparecem neste diff.
- `apps/web/repositories/auth.ts` segue sem ramo explícito de 401/403 no `login` (devolve `envelope.data` ou deixa o `fetch` estourar). Padrão anterior à tarefa.
- Neste sandbox o Vitest não chegou a gravar o bundle da config (`EROFS` em `node_modules/.vite-temp`). A suíte pedida não foi executada aqui; isso não é defeito do diff.
