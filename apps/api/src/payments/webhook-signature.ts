import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyPagamentoWebhookSignature(input: {
  secret: string;
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string;
}): boolean {
  if (!input.xSignature || !input.xRequestId) {
    return false;
  }

  const parts = Object.fromEntries(
    input.xSignature.split(',').map((part) => {
      const [key, ...rest] = part.split('=');
      return [key?.trim() ?? '', rest.join('=').trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) {
    return false;
  }

  const canonical = `id:${input.dataId};request-id:${input.xRequestId};ts:${ts};`;
  const expected = createHmac('sha256', input.secret)
    .update(canonical)
    .digest('hex');

  if (expected.length !== v1.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}
