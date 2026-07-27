# Product Checkout Platform

A full-stack application implementing a complete credit card checkout flow for a single product: catalog with live stock, credit card and delivery data capture, payment summary, processing through an external payment gateway (sandbox environment), and inventory update.

## 🔗 Links

| Resource | URL |
|---|---|
| Repository | https://github.com/BramBit/product-checkout-platform |
| Backend (API) | https://product-checkout-platform.onrender.com |
| Swagger Documentation (OpenAPI) | https://product-checkout-platform.onrender.com/docs |
| Frontend (Deployed App) | https://product-checkout-platform-web.vercel.app |

> The API documentation is publicly exposed via Swagger at `/docs`, auto-generated from the controllers' decorators. No authentication required to browse it.

---

## 🧱 Tech stack

**Backend**
- Node.js + TypeScript
- NestJS (HTTP framework and dependency injection)
- PostgreSQL (native `pg` driver, no ORM)
- `node-pg-migrate` for versioned migrations
- Jest for unit testing

**Frontend**
- React + TypeScript (Vite)
- Redux Toolkit + `redux-persist`
- Vitest + React Testing Library for unit testing

**Infrastructure**
- Monorepo managed with `pnpm` workspaces
- Backend deployed on Render (Web Service + managed PostgreSQL)
- Frontend deployed on Vercel

---

## 🏗️ Architecture

The backend follows **Hexagonal Architecture (Ports & Adapters)**, splitting each business module into three layers:

```
apps/api/src/modules/<module>/
├── domain/           → Pure entities + interfaces (ports), no framework dependencies
├── application/      → Use cases, orchestrate the domain through the ports
└── infrastructure/    → Concrete adapters: HTTP controllers, Postgres repositories,
                         payment gateway client, DTOs
```

**Why this separation:** the domain (`Product`, `Customer`, `Delivery`, `Transaction`) knows nothing about Nest, `pg`, or any infrastructure detail. This allows testing business logic with simple mocks, without spinning up a database or HTTP layer, and sustains 98%+ coverage on `domain` and `application` without friction.

**Railway Oriented Programming (ROP):** use cases don't throw exceptions for expected business errors (product not found, insufficient stock, declined card). Instead, they return a `Result<T, E>` type (`apps/api/src/shared/kernel/result.ts`) that forces explicit handling of both the success and failure paths at every step, avoiding nested `try/catch` blocks. Typed `DomainError` subclasses (`ProductNotFoundError`, `InsufficientStockError`, etc.) are translated into the correct HTTP status codes by a global exception filter.

**No ORM, by design:** repositories (adapters) use the `pg` driver directly instead of TypeORM or Prisma. This keeps the domain layer from indirectly depending on an ORM's decorators or conventions, preserving the purity of the `domain` layer.

---

## 🔄 Business flow (5 screens)

1. **Product** — displays the available product and its live stock.
2. **Card and delivery info** (modal) — card capture (validated with the Luhn algorithm and brand detection) plus shipping data. The card is **tokenized directly from the browser against the payment gateway**; the full card number never reaches the backend.
3. **Payment summary** (backdrop) — breakdown of product amount + base fee + delivery fee, with confirmation.
4. **Final status** — result screen (approved / declined), with stock update when applicable.
5. **Back to product** — with stock already updated.

### Payment processing (asynchronous)

The payment gateway never returns the final result immediately; every transaction starts as `PENDING`. The design adopted:

- `POST /transactions` creates the transaction as `PENDING`, fetches the acceptance token, and fires **a single** creation call against the gateway, responding immediately to the client (it doesn't block the request waiting for the final result).
- `GET /transactions/:id` checks the current status: if it's already a final state (`APPROVED`/`DECLINED`/`ERROR`) it's returned as-is; if still `PENDING`, it queries the real status from the gateway, updates the database, and — if it became `APPROVED` — decreases the product's stock.
- The **frontend polls** this second endpoint every 1.5s (up to ~15 attempts) until a final status is reached.

This avoids blocking the backend with long waits, and as a side effect solves resilience on refresh: since the `transactionId` is persisted in the client state (`redux-persist`), if the user reloads the page mid-process, the frontend simply resumes polling `GET /transactions/:id` without losing context.

---

## 📡 Endpoints

| Resource | Method | Route | Description |
|---|---|---|---|
| Catalog | GET | `/products` | List products with stock |
| Catalog | GET | `/products/:id` | Product detail |
| Customers | POST | `/customers` | Create or retrieve a customer by email |
| Customers | GET | `/customers/:id` | Customer detail |
| Deliveries | POST | `/deliveries` | Register delivery information |
| Deliveries | GET | `/deliveries/:id` | Delivery detail |
| Transactions | POST | `/transactions` | Create the transaction and trigger the payment |
| Transactions | GET | `/transactions/:id` | Check/update payment status |

Full specification, with request/response schemas, available in Swagger (`/docs`).

---

## 🗄️ Data model

```
products
├── id (uuid, PK)
├── name, description
├── price_in_cents, stock_quantity
├── image_url
└── created_at

customers
├── id (uuid, PK)
├── full_name, email (unique), phone, document_id
└── created_at

deliveries
├── id (uuid, PK)
├── customer_id (FK → customers)
├── address, city, region, postal_code
└── created_at

transactions
├── id (uuid, PK)
├── product_id (FK → products)
├── customer_id (FK → customers)
├── delivery_id (FK → deliveries)
├── quantity
├── product_amount_in_cents, base_fee_in_cents, delivery_fee_in_cents, total_amount_in_cents
├── status (PENDING | APPROVED | DECLINED | ERROR)
├── gateway_transaction_id, gateway_status_detail
├── created_at, updated_at
```

Versioned migrations live in `apps/api/migrations/`, run with `node-pg-migrate`. The database is seeded with 4 sample products through an idempotent script (`pnpm run seed`).

---

## 🔒 Security

- **The full card number is never persisted or transmitted to the backend.** Tokenization happens in the browser, directly against the payment gateway; the backend only receives and forwards a single-use token.
- Security headers via `helmet` (CSP, HSTS, X-Content-Type-Options, etc.), visible in any API response.
- CORS restricted to the frontend's origin through an environment variable.
- Strict payload validation with `class-validator` (`whitelist`, `forbidNonWhitelisted`) on every input DTO.
- Typed domain errors, with no leakage of internal details (stack traces, SQL queries) in HTTP responses.

---

## 🧪 Testing and coverage

Both projects exceed the 80% threshold required across all metrics.

**Backend** (`pnpm --filter api run test:cov`)

| Metric | % |
|---|---|
| Statements | 99.80% |
| Branches | 82.83% |
| Functions | 100% |
| Lines | 99.78% |

> Pure wiring code with no business logic was excluded from coverage measurement (`main.ts`, `*.module.ts`, `seed.ts`, connection pool provider, decorator-only DTOs) — its behavior is indirectly validated through the tests of the components that use it.

**Frontend** (`pnpm --filter web run test:coverage`)

| Metric | % |
|---|---|
| Statements | 96.15% |
| Branches | 87.67% |
| Functions | 94.66% |
| Lines | 96.84% |

Testing strategy: pure unit tests on `domain` and `application` with port mocks (no real database); controller and repository tests with Pool/HTTP client mocks; React component tests with Testing Library simulating real user interaction (including error cases, stock limits, and the full polling cycle with simulated timers).

---

## ⚙️ Running it locally

### Requirements
- Node.js 20+
- pnpm 9+
- Docker (for local PostgreSQL)

### Backend

```bash
docker compose up -d
cd apps/api
cp .env.example .env   # fill in with the sandbox payment gateway keys
pnpm install
pnpm run migrate:up
pnpm run seed
pnpm run start:dev
```

See `.env.example` for the full list of required variables (sandbox payment gateway keys, configurable base and delivery fees).

### Frontend

```bash
cd apps/web
cp .env.example .env   # fill in VITE_API_URL and the gateway's public key
pnpm install
pnpm run dev
```

### Tests

```bash
pnpm --filter api run test:cov
pnpm --filter web run test:coverage
```

---

## 📝 Relevant design decisions

- **Single featured product on the main view**: the assignment describes the onboarding for buying *one* specific product (not a browsable catalog); the database is seeded with several products to exercise varied stock levels, but the UI shows the store's main product, consistent with the required 5-screen flow.
- **Vitest instead of Jest on the frontend**: same assertion API as Jest, but with native integration and no extra configuration friction for ESM/TypeScript on top of Vite.
- **pnpm workspaces (monorepo)**: a single repository with `apps/api` and `apps/web`, simplifying version management and the feature-branch/pull-request workflow.
- **Environment-configurable fees**: the base fee and delivery fee are read from environment variables, not hardcoded in the domain.
