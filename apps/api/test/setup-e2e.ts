import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(__dirname, '../.env'));
process.env.JWT_SECRET ??= 'e2e-only-jwt-secret';
process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@127.0.0.1:5432/postgres';

const apiRoot = resolve(__dirname, '..');
execFileSync(resolve(apiRoot, 'node_modules/.bin/prisma'), ['db', 'migrate'], {
  cwd: apiRoot,
  env: process.env,
  stdio: 'pipe',
});
