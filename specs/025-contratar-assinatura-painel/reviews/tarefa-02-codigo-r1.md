# Parecer de Código — Tarefa 2

**Veredito:** REPROVADO

## Apontamentos (bloqueiam)

1. **`temporal-polyfill` entrou sem autorização em `docs/architecture.md`** — `apps/api/package.json`; `apps/api/src/main.ts:1`; `apps/api/test/setup-e2e.ts:1`  
   Regra violada: §2 *Dependências além do gerador* — “Só entra no projeto o que está nesta lista”; “usá-las sem estar nesta tabela continua sendo defeito.”  
   Prejuízo concreto: a tabela de deps e o `package.json` deixam de contar a mesma história; Prisma 8/`DateTime` passa a depender de um pacote invisível na constituição, e o próximo PR não tem critério claro para aceitar ou recusar o polyfill.  
   Correção esperada: incluir `temporal-polyfill` na tabela `api` de `docs/architecture.md` (com o “por quê”) **ou** remover o pacote se houver caminho oficial sem ele — sem isso, o stage não fecha.

## Sugestões (não bloqueiam)

- **`@mercadopago/sdk-react`**: ok — já está na tabela §2; uso só no formulário (`CardPayment` / `initMercadoPago`), sem cobrança (#26).
- **Guards / public key**: `JwtAuthGuard` + `RolesGuard` + `@Roles('TRAINER')` no controller; `checkoutConfig()` via `ConfigService.getOrThrow('PAGAMENTO_PUBLIC_KEY')` — alinhado a ID9 / ID17 / ID20.
- **Camadas**: controller sem Prisma; service com catálogo + Prisma; web em `repositories/` → `hooks/` → páginas sem axios — ok.
- **Envelope**: services devolvem `data` cru; interceptor global monta `{ statusCode, data }` — ok.
- Unicidade de um `PENDING` por treinador (§5.2 / RN13) ainda não está no service — coerente com escopo T5, mas dois `POST` seguidos já podem duplicar linha.
- `PrismaService` re-registrado em `BillingModule` (mesmo padrão de `UsersModule`) — múltiplas conexões; candidato a `PrismaModule` global depois.
- Mapa §6 / árvore §3 ainda falam em `orders/` e não listam `billing/` — alinhar quando a história fechar.

## Observações fora do escopo deste diff

- Shell `git diff --cached` indisponível neste modo Ask; revisão feita nos arquivos da T2 (implementação + locks) contra `architecture.md`.
- Testes 401/403 de billing ficam para T6; os guards já protegem o endpoint da public key.
