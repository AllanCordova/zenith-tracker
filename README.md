# Zenith Tracker

Acompanhamento nutricional para treinos híbridos: o aluno vê se o dia fechou sem virar planilha; o treinador monta o plano e só usa a carteira com a assinatura confirmada.

## Autores

- Allan Roberto Cordova de Campos — [AllanCordova](https://github.com/AllanCordova)

## Documentação

- [PRD](docs/prd.md) — o que o produto faz
- [Jornadas](docs/user-flows.md) — o que a pessoa vive na tela
- [Tokens de design](docs/design-tokens.md) — paleta, espaço, tipo e botão
- [Checklist da disciplina](docs/checklist.md) — regras, IDs e entregas
- [Arquitetura](docs/architecture.md) — stack, monorepo, testes e diagrama ER

## Stack

- **API:** NestJS 12 (CommonJS) + Prisma 8 + PostgreSQL — `apps/api`
- **Web:** Next.js 16 (React, App Router, Tailwind 4) — `apps/web`
- **Pagamento:** Mercado Pago (sandbox)
- **Banco local:** Docker Compose na raiz
- **Banco de produção:** Vercel Postgres

## Em produção

- **Aplicação:** ainda não
- **API (Swagger):** ainda não

## Quick Start

Node.js 24.9+. Cada app tem o seu `package.json` (sem workspaces).

```bash
docker compose up -d
npm install --prefix apps/api
npm install --prefix apps/web
npm run api    # Nest em http://localhost:3000
npm run web    # Next em http://localhost:3000 — use outra porta se a API já ocupou
```

Testes e lint (comandos da raiz):

```bash
npm test
npm run lint
npm run test:e2e
```
