# Parecer de Código — Tarefa 9

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

Diff de regressão (Vitest + e2e); `onSubmit` permanece noop com `TODO #26`.

## Sugestões (não bloqueiam)

- `expect("chargeOrder" in billing).toBe(false)` quebra quando a #26 exportar essas funções — o cadeado útil é “não chama HTTP de cobrança”.
- Após `unmount`, mock de `getCurrentOrder` não prova estado de servidor.
