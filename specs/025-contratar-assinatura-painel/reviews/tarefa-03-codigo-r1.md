# Parecer de Código — Tarefa 3

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

- **Camadas (ID6):** regra no `BillingService` (`ConflictException` antes do `Order.create`); controller só anota/delega; Prisma fora do controller.
- **Resposta/erro (ID10):** 409 via filtro global `{ statusCode, message, error }`; e2e confere `statusCode` + mensagem.
- **Front (§4):** página usa hook + `FormError`; HTTP 409 tratado em `repositories/billing.ts` (axios só em `lib/http.ts`).
- **Seed:** `Subscription` ACTIVE no e2e com `// TODO #26`.

## Sugestões (não bloqueiam)

- Em `assinatura/page.tsx`, o `catch` decide pelo texto `/já está ativa/i` em vez de um erro tipado/status do repositório — se a copy da API mudar, a UI cai no genérico de conexão.
- Vitest cobre a página com `mockRejectedValue` no repositório; não há asserção unitária de que `createOrder` mapeia `response.status === 409` → `throw`.
- E2e não asserta `error: 'Conflict'` nem ausência de `data` no envelope de conflito.
