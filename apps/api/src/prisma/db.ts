import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';

const contractJson = JSON.parse(
  readFileSync(join(__dirname, 'contract.json'), 'utf8'),
);

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL'],
});
