This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Inventory Import Infrastructure

Employee users can upload daily `.csv` or `.xlsx` inventory files from `/employee/settings`.

The upload flow:

- Parses the first spreadsheet sheet.
- Normalizes common columns such as name, SKU, UPC/barcode, category, price, cost, quantity, variants, and Clover item ID.
- Stores each upload as an import snapshot.
- Creates a Clover dry-run sync plan that compares spreadsheet rows against Clover by item ID, UPC/code, or SKU.
- Keeps Clover writes locked unless explicitly enabled later.

Storage:

- If `MEDUSA_BACKEND_URL` is configured, these Next routes proxy imports and
  sync plans to the Medusa backend at `/admin/clover/imports`.
- If `DATABASE_URL` is configured, import snapshots are stored in the `inventory_import_batches` table.
- Without `DATABASE_URL`, local development falls back to `.data/inventory-imports/batches.json`.

Important environment variables:

```bash
DATABASE_URL=
CLOVER_ENV=sandbox
CLOVER_MERCHANT_ID=
CLOVER_ACCESS_TOKEN=
CLOVER_ALLOW_WRITES=false
CLOVER_SYNC_ENABLED=false
CLOVER_TOKEN_ENCRYPTION_KEY=
AUTH_SECRET=
MEDUSA_BACKEND_URL=http://localhost:9000
```

For now, Clover sync planning is dry-run only. Clover remains the intended source of truth for inventory.

Use `docs/sample-inventory-import.csv` as a safe upload template for local dry-run testing.

## Medusa Backend

A Medusa v2 backend has been added under `apps/upnsmoke-medusa/apps/backend`.
It owns the Clover operations API:

- `GET /admin/clover/imports`
- `POST /admin/clover/imports`
- `GET /admin/clover/imports/:id`
- `POST /admin/clover/imports/:id/sync-plan`

Run it locally:

```bash
npm run medusa:db
npm run medusa:migrate
npm run medusa:user -- -e owner@upnsmoke.local -p change-me-now
npm run medusa:seed
npm run medusa:dev
```

`npm run medusa:db` uses `docker-compose.medusa.yml` to start local Postgres
and Redis. If Docker is not installed, use a Neon/local Postgres URL instead
and set `DATABASE_URL` in `apps/upnsmoke-medusa/apps/backend/.env`.

Open the Medusa admin at `http://localhost:9000/app` after the backend starts.

## Employee Login

Employee phone/code login has been retired. The employee portal now exposes
Apple, Google, and passkey entry points from `/employee/login`.

Provider login requires server-side OAuth credentials and an employee allowlist:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
EMPLOYEE_ALLOWED_EMAILS=owner@example.com,manager@example.com
EMPLOYEE_ALLOWED_DOMAINS=upnsmokenh.com
EMPLOYEE_OWNER_EMAILS=owner@example.com
```

Passkey login is wired as its own endpoint but remains disabled until credential
registration/storage is added.

For local testing only, `/employee/login` shows a dev login button when
`NODE_ENV !== "production"` or `EMPLOYEE_DEV_LOGIN_ENABLED=true`. This creates
an owner session without restoring the old sign-in-code flow.
