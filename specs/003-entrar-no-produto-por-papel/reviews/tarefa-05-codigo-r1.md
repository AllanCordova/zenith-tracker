# Parecer de Código — Tarefa 5

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

## Sugestões (não bloqueiam)
- `TrainerAreaController` (`GET /trainer/area`) ficou em `apps/api/src/auth/` e no `AuthModule`. O `architecture.md` reserva essa pasta a JWT, strategies e guards, e pede um módulo Nest por domínio. Para este stub que devolve `{}`, abrir um módulo de treinador agora seria indireção sem ganho; quando a carteira nascer, vale mover o controller para o domínio certo, senão o `AuthModule` vira depósito de rota autenticada.
- Em `apps/web/app/treinador/page.tsx`, `getSessionUser()` roda no render. No SSR `window` não existe, então `role` vem `undefined` e o HTML inicial ainda inclui “carteira ainda não libera”; no cliente o aluno cai em `null` + `router.push`. Pode haver mismatch de hidratação e um flash do substituto da área do treinador. Ler a sessão depois do mount evita isso.
- `areaPathForRole` só é usada dentro de `if (role === "STUDENT")`, então o ramo `TRAINER` nunca corre nesse call site — equivale a `router.push("/aluno")`. Login e cadastro continuam com o ternário inline; o helper ainda não é a fonte única do mapa papel → rota.
- O Vitest amarra a ausência do recurso ao texto `carteira ainda não libera`. Esse copy é o TODO da US05; troca de copy quebra o teste da CA4 sem a guarda de papel ter mudado. O `push("/aluno")` já cobre o redirecionamento.

## Observações fora do escopo deste diff
- `apps/web/app/login/page.tsx` e `apps/web/app/cadastro/page.tsx` ainda duplicam `role === "STUDENT" ? "/aluno" : "/treinador"`.
- `apps/web/app/aluno/page.tsx` ainda guarda o `typeof window` local; `getSessionUser` agora já faz isso.
- `JwtStrategy` continua colocando o `User` do Prisma (com `passwordHash`) em `request.user`. O `RolesGuard` só lê `role` e o 403 não vaza o hash; sanitizar o usuário no `validate` continua candidata a Issue de manutenção.
- Neste sandbox o e2e de `GET /trainer/area` não chegou a exercitar o 403 (register 500 / Postgres `ECONNREFUSED` em `127.0.0.1:5432`) e o Vitest não subiu (`EROFS` no temp do Vite). Não é defeito do diff; a suíte precisa de Postgres e FS gravável.
