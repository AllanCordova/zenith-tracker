import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Prisma User contract', () => {
  it('declares User with unique email', () => {
    const source = readFileSync(join(__dirname, 'contract.prisma'), 'utf8');

    expect(source).toMatch(/model\s+User\s*\{[\s\S]*email\s+String\s+@unique/);
    expect(source).toMatch(/passwordHash/);
    expect(source).toMatch(/STUDENT/);
    expect(source).toMatch(/TRAINER/);
  });
});
