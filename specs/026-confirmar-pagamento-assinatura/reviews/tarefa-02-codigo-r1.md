# Parecer de Código — Tarefa 2

**Veredito:** REPROVADO

## Apontamentos (bloqueiam)

1. **Gateway trata credencial `TEST-` como stub e não cobra no Mercado Pago** — `apps/api/src/payments/mercadopago.gateway.ts:16-25`  
   Regra violada: `docs/architecture.md` §2.1 Pagamento (ID20) — checkout em sandbox real.  
   Prejuízo: access token de teste do MP costuma ser `TEST-…`; com early-return, `payment.create` nunca roda e grava `gatewayPaymentId` inventado. Stub de e2e já existe via `overrideProvider`; este early-return anula a integração real.

2. **`chargeOrder` engole falha HTTP e a página navega como se tivesse cobrado** — `apps/web/repositories/billing.ts:75-83` + `apps/web/app/treinador/pagamento/page.tsx:57-59`  
   Regra violada: engolir falha silenciosamente; contraste com `createOrder` + checagem antes do `push`.  
   Prejuízo: 4xx/5xx não rejeitam; `onSubmit` sempre navega para status sem `Payment` criado.

## Sugestões (não bloqueiam)

- Extrair `useChargeOrder` (padrão dos outros hooks).
- `payer.email` fixo — preferir e-mail do treinador autenticado.
- Swagger tipado no charge; instanciar client MP uma vez.
