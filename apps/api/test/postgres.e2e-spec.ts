import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDb } from './../src/prisma/db';

const db = createDb(process.env.DATABASE_URL ?? '');
const apiRoot = resolve(__dirname, '..');
const prismaBin = resolve(apiRoot, 'node_modules/.bin/prisma');

function prismaJsonResult<T>(args: string[]): T {
  const output = execFileSync(prismaBin, args, {
    cwd: apiRoot,
    env: process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const lines = output
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line) as { kind?: string; envelope?: { result: T } });
  const resultLine = lines.find((line) => line.kind === 'result');
  if (!resultLine?.envelope) {
    throw new Error(`Prisma ${args.join(' ')} produced no JSON result`);
  }
  return resultLine.envelope.result;
}

function committedAppMigrationNames(): string[] {
  const appMigrations = resolve(apiRoot, 'migrations/app');
  return readdirSync(appMigrations, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'refs')
    .map((entry) => entry.name);
}

describe('Postgres for auth e2e (Compose)', () => {
  afterAll(async () => {
    await db.close();
  });

  it('documents DATABASE_URL for PostgreSQL at 127.0.0.1:5432 in .env.example', () => {
    const example = readFileSync(resolve(__dirname, '../.env.example'), 'utf8');
    expect(example).toMatch(/DATABASE_URL=postgresql:\/\/\S+@127\.0\.0\.1:5432\//);
  });

  it('Compose publishes PostgreSQL on 5432 with a healthcheck', () => {
    const compose = readFileSync(
      resolve(__dirname, '../../../docker-compose.yml'),
      'utf8',
    );
    expect(compose).toMatch(/5432:5432/);
    expect(compose).toMatch(/healthcheck:/);
    expect(compose).toMatch(/pg_isready/);
  });

  it('ships a Prisma 8 migration package for User in the repository', () => {
    const appMigrations = resolve(apiRoot, 'migrations/app');
    expect(existsSync(appMigrations)).toBe(true);

    const names = committedAppMigrationNames();
    expect(names.length).toBeGreaterThan(0);
    expect(
      names.some((name) =>
        existsSync(resolve(appMigrations, name, 'migration.json')),
      ),
    ).toBe(true);
  });

  it('applies committed Prisma 8 migrations on the Compose PostgreSQL', () => {
    const log = prismaJsonResult<{ records: Array<{ name: string }> }>([
      'migration',
      'log',
      '--json',
    ]);
    const applied = new Set(
      log.records.map((record) => record.name).filter(Boolean),
    );
    expect(
      committedAppMigrationNames().some((name) => applied.has(name)),
    ).toBe(true);
  });

  it('User schema exists on the Compose PostgreSQL', async () => {
    expect(process.env.DATABASE_URL).toMatch(/127\.0\.0\.1:5432|localhost:5432/);
    const row = await db.orm.public.User.first({
      email: 'e2e.schema.probe@example.com',
    });
    expect(row).toBeNull();
  });
});
