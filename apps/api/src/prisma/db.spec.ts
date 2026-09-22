import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Prisma client factory', () => {
  it('does not construct the client at module load', () => {
    const source = readFileSync(join(__dirname, 'db.ts'), 'utf8');
    expect(source).not.toMatch(/export const db = postgres/);
    expect(source).toMatch(/export function createDb/);
  });

  it('createDb recusa URL vazia sem vazar o valor', async () => {
    const { createDb } = await import('./db');
    expect(() => createDb('')).toThrow('DATABASE_URL is not set');
  });
});
