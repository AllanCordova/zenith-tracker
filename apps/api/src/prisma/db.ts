import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';

const contractJson = JSON.parse(
  readFileSync(join(__dirname, 'contract.json'), 'utf8'),
);

export type Db = ReturnType<typeof postgres<Contract>>;

const clients = new Map<string, Db>();

export function createDb(url: string): Db {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  const existing = clients.get(url);
  if (existing) {
    return existing;
  }
  const client = postgres<Contract>({
    contractJson,
    url,
  });
  clients.set(url, client);
  return client;
}
