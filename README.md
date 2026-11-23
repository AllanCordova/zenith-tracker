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
- **Pagamento:** Mercado Pago Checkout Transparente (sandbox)
- **Banco local:** Docker Compose na raiz
- **Banco de produção:** Vercel Postgres

## Em produção

A partir da Entrega 3.

## Quick Start

Node.js 24.9+. Cada app tem o seu `package.json` (sem workspaces). Os comandos abaixo são na raiz do repositório. A API fica em http://localhost:3001 e o Next em http://localhost:3000.

```bash
# Sobe o PostgreSQL 16. Usuário, senha e banco são postgres, na porta 5432.
docker compose up -d

# Instala as dependências de cada app.
npm install --prefix apps/api
npm install --prefix apps/web

# Cria o ambiente local. Não commite o .env.
cp apps/api/.env.example apps/api/.env
```

Abra `apps/api/.env` e troque o `JWT_SECRET` vazio por um texto desta máquina, por exemplo `dev-only-secret`. Sem ele a API não assina o token. `DATABASE_URL` já aponta para o Compose. `PAGAMENTO_ACCESS_TOKEN`, `PAGAMENTO_PUBLIC_KEY` e `PAGAMENTO_WEBHOOK_SECRET` podem ficar vazios para cadastro, login e Pedido. Preencha os três antes de abrir o checkout ou cobrar no Mercado Pago.

```bash
# Cria as tabelas no banco novo. Prisma 8 aplica o pacote de migrations com db migrate.
cd apps/api
npx prisma db migrate
cd ../..

# Sobe a API. Swagger em http://localhost:3001/docs
npm run api

# Opcional: sobe o Next em http://localhost:3000
npm run web
```

`npm run dev` sobe a API e o Next juntos.

Testes e lint, na raiz, com o banco no ar:

```bash
npm test
npm run lint
npm run test:e2e
```
