import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const contractSource = () =>
  readFileSync(join(__dirname, 'contract.prisma'), 'utf8');

describe('Prisma User contract', () => {
  it('declares User with unique email', () => {
    const source = contractSource();

    expect(source).toMatch(/model\s+User\s*\{[\s\S]*email\s+String\s+@unique/);
    expect(source).toMatch(/passwordHash/);
    expect(source).toMatch(/STUDENT/);
    expect(source).toMatch(/TRAINER/);
  });
});

describe('Prisma Order and Subscription contract', () => {
  it('declares Order with planCode, amountCents and status', () => {
    const source = contractSource();

    expect(source).toMatch(/model\s+Order\s*\{/);
    expect(source).toMatch(/trainerId/);
    expect(source).toMatch(/planCode/);
    expect(source).toMatch(/amountCents/);
    expect(source).toMatch(/MONTHLY/);
    expect(source).toMatch(/YEARLY/);
    expect(source).toMatch(/PENDING/);
    expect(source).toMatch(/PAID/);
    expect(source).toMatch(/REFUSED/);
    expect(source).toMatch(/EXPIRED/);
    expect(source).toMatch(/createdAt/);
  });

  it('declares Subscription with planCode and status', () => {
    const source = contractSource();

    expect(source).toMatch(/model\s+Subscription\s*\{/);
    expect(source).toMatch(/orderId/);
    expect(source).toMatch(/ACTIVE/);
    expect(source).toMatch(/INACTIVE/);
    expect(source).toMatch(/activatedAt/);
  });
});

describe('Prisma Payment contract', () => {
  it('declares Payment with orderId, gatewayPaymentId, status and receivedAt', () => {
    const source = contractSource();

    expect(source).toMatch(/model\s+Payment\s*\{/);
    expect(source).toMatch(/orderId/);
    expect(source).toMatch(/gatewayPaymentId/);
    expect(source).toMatch(/status/);
    expect(source).toMatch(/receivedAt/);
  });
});
