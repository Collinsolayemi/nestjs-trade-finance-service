# Trade API (`trade-api`)

A NestJS + TypeScript backend service for managing trade finance operations, regulatory forms, SWIFT messaging, and core banking integrations.

---

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) v10 (TypeScript, Express)
- **Database & ORM:** PostgreSQL with [Sequelize](https://sequelize.org/) (`sequelize-typescript`)
- **Caching & Queues:** Redis (`ioredis`, `@liaoliaots/nestjs-redis`) + [BullMQ](https://docs.bullmq.io/) (`@nestjs/bullmq`) + [Bull Board](https://github.com/felixmosh/bull-board)
- **Scheduling:** `@nestjs/schedule` with custom `@SafeCron` decorator
- **Logging & Observability:** Winston (`nest-winston`) with Elasticsearch transport (`winston-elasticsearch`) and Morgan HTTP logging
- **File Transfer (SWIFT):** SFTP (`nest-sftp`)
- **API Documentation:** Swagger / OpenAPI (`@nestjs/swagger`)
- **Security:** `helmet`, CORS, JWT Bearer authentication, permission-based guards, and `express-basic-auth` for queue dashboards

---

## Project Structure

```text
src/
├── main.ts                     # App bootstrap, global prefix (/v1), Swagger, guards, interceptors, filters
├── app.module.ts               # Root module, DB/Redis/BullMQ/BullBoard setup, middleware configuration
├── app.controller.ts           # Root endpoints (e.g., concession-group lookup)
├── config/                     # App, Sequelize, Redis, SFTP, Swagger, and Winston configurations
├── middlewares/                # Request authentication (JWT) and Morgan HTTP logging
├── helpers/                    # Shared helper service
├── common/
│   ├── constants/              # App constants & sample payloads
│   ├── decorators/             # Custom decorators (e.g., @Permissions, @SafeCron)
│   ├── dto/                    # Shared DTOs
│   ├── enums/                  # Domain, status, environment, and permission enums
│   ├── filters/                # Global exception filter (CatchAllFilter)
│   ├── guards/                 # PermissionGuard
│   ├── interceptors/           # SuccessResponse, RequestBodyAndResponse, ActivityLog interceptors
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # SWIFT MT message generators, encryption, DB sequences, formatters
├── modules/                    # Core trade finance domain modules
│   ├── account-creation/
│   ├── activity-log/
│   ├── bills-for-collection/
│   ├── configuration/
│   ├── credit-line/
│   ├── guarantees/
│   ├── letter-of-credit/
│   ├── payment/
│   ├── regulatory-form/
│   ├── swift-bic-data/
│   └── trade-journal-posting/
└── services/                   # External & internal microservice integrations
    ├── auth/
    ├── cams/
    ├── chart-of-accounts/
    ├── compliance/
    ├── concession-group/
    ├── currency/
    ├── customer-management/
    ├── document-management/
    ├── fiscal-period/
    ├── http-client/
    ├── one-plug/
    ├── product-management/
    ├── redis/
    ├── rules-configuration/
    ├── trade-product-factory/
    ├── treasury-trade/
    └── trms/
```

---

## Core Domain Modules & API Routes

All API endpoints are served under the global prefix `/v1`.

| Module | Route Prefix(es) | Description |
| --- | --- | --- |
| **Regulatory Form** | `/v1/regulatory-form`<br>`/v1/stp-exceptions`<br>`/v1/stp-exception-requests` | Manages Form M, Form NXP, Form NCX, and Form A workflows, charges/taxes, and Straight-Through Processing (STP) exceptions. |
| **Letter of Credit** | `/v1/letter-of-credit` | Full LC lifecycle: pre-issuance, issuance, amendment, adjustment, document lodgement, pre-negotiation, negotiation, payment, settlement details, assignment of proceeds, cancellation, expiry, FX bid requests, free-format messages, and templates. |
| **Bills for Collection** | `/v1/bills-for-collection` | Handles bills for collection requests, acceptance, amendment, adjustment, payment, non-acceptance/non-payment, acknowledgements, closure, and free-format messages. |
| **Guarantees** | `/v1/guarantees` | Manages trade guarantees, requests, amendments, adjustments, claims, presented documents, acknowledgements, cancellations, and free-format messages. |
| **Payment** | `/v1/payment` | Inward customer payments, inward bank payments, payment requests, and payment templates. |
| **Credit Line** | `/v1/credit-line` | Credit line records and approval/management requests. |
| **Trade Journal Posting** | `/v1/trade-journal-posting` | Trade-related accounting and journal posting operations. |
| **Account Creation** | `/v1/account`<br>`/v1/account-type` | Trade account creation and account type management. |
| **Configuration** | `/v1/clause`<br>`/v1/reference` | Trade clauses, clause requests, and reference number management. |
| **SWIFT BIC Data** | `/v1/swift-bic` | Lookup and management of SWIFT/BIC directory data. |
| **Activity Log** | `/v1/activity-logs` | Audit trail for user and system actions. |
| **Concession Group** | `/v1/concession-group/by-charge/:chargeId` | Fetches concession groups associated with a charge ID. |

---

## Background Queues, Cron Jobs & SWIFT Messaging

- **BullMQ Queues:** Asynchronous processing is powered by BullMQ and Redis across:
  - Regulatory form validation, Form M (TradeGov), Form NXP/NCX/A (TRMS), and regulatory form charges
  - Letter of Credit pending request journal reversal, SWIFT messages, and expiry
  - Bills for Collection SWIFT messages
- **Queue Dashboard:** Bull Board is mounted at `/queues` and protected with HTTP Basic Auth (`REDIS_QUEUE_USERNAME` / `REDIS_QUEUE_PASSWORD`).
- **Scheduled Jobs:** Periodic background tasks use `@SafeCron('*/5 * * * *')` in `RegulatoryFormService` and `AuthService`.
- **SWIFT MT Utilities:** `src/common/utils/` includes generators for SWIFT MT messages (`MT202`, `MT410`, `MT412`, `MT420`, `MT422`, `MT430`, `MT700`, `MT707`, `MT730`, `MT752`, `MT754`, `MT756`, and `MTn99`), transmitted via SFTP.

---

## Authentication, Authorization & Middleware

- **Authentication:** `AuthenticateRequestMiddleware` validates the `Authorization` header token against the Auth service on all routes except `/swagger` and `/queues`, attaching `user`, `queryObj`, `initiatorObj`, and `approverObj` to the request.
- **Authorization:** Global `PermissionGuard` checks `@Permissions(...)` metadata against `req.user.user_permissions`.
- **Global Pipeline:**
  - `ValidationPipe` for DTO validation
  - `SuccessResponseInterceptor`, `RequestBodyAndResponseInterceptor`, and `ActivityLogInterceptor`
  - `CatchAllFilter` for centralized error handling and logging

---

## Getting Started

### Prerequisites

- **Node.js:** v20+ (Dockerfile uses `node:20-alpine`)
- **Package Manager:** Yarn (or npm)
- **Databases & Services:** PostgreSQL, Redis, and access to configured downstream banking/trade services (plus Elasticsearch and SWIFT SFTP where enabled)

### Installation

```bash
yarn install
```

### Environment Configuration

Copy `.env.example` to `.env` and populate the required values:

```bash
cp .env.example .env
```

Key configuration groups in `src/config/index.ts` and `.env.example` include:

- **Application:** `NODE_ENV`, `PORT`, `CORS_ORIGIN`
- **PostgreSQL (`DB_*`):** `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_DIALECT`, `DB_SYNC`, `DB_SSL`, pool settings (`DB_POOL_MIN`, `DB_POOL_MAX`, `DB_POOL_IDLE`, `DB_POOL_EVICT`), `DB_LOGGING`
- **Redis & Bull Board:** `REDIS_HOST`, `REDIS_PORT`, `REDIS_URL`, `REDIS_QUEUE_USERNAME`, `REDIS_QUEUE_PASSWORD`, `AUTH_REDIS_HOST`, `AUTH_REDIS_PORT`, `AUTH_REDIS_PASSWORD`
- **Elasticsearch:** `ELASTIC_SEARCH_HOST`, `ELASTIC_SEARCH_USERNAME`, `ELASTIC_SEARCH_PASSWORD`, `ELASTIC_SEARCH_INDEX_NAME`, `ELASTIC_SEARCH_INDEX_SUFFIX_PATTERN`
- **SWIFT SFTP:** `SWIFT_SFTP_HOST`, `SWIFT_SFTP_PORT`, `SWIFT_SFTP_USERNAME`, `SWIFT_SFTP_PASSWORD`, `SWIFT_REMOTE_BASE_PATH`, `SWIFT_CONNECTION_MODE`, `SFTP_FTP_CONNECTION_DEBUG`
- **External Services & Credentials:** Auth, CAMS (`CAMS_API_KEY`, `CAMS_APP_ID`), Account Enquiries/Management/Restriction/Opening, DMS, Fiscal Period, Central Journal Posting, Chart of Accounts, Product Management, Currency, Customer Management, Treasury Trade, Trade Product Factory, Compliance, OnePlug, TRMS, TradeGov, Concession Group, and Trade Rules.

> **Note:** In non-production environments (not in `NonDevelopmentEnvironmentEnum`), the app automatically initializes required PostgreSQL sequences (`createDatabaseSequences`) and mounts Swagger on startup.

---

## Running the Application

```bash
# Development
yarn start

# Development (watch mode)
yarn start:dev

# Debug mode
yarn start:debug

# Build
yarn build

# Production
yarn start:prod
```

### Docker

The included `Dockerfile` uses a multi-stage `node:20-alpine` build and exposes port `3000`:

```bash
docker build -t trade-api .
docker run -p 3000:3000 --env-file .env trade-api
```

---

## API Documentation (Swagger)

When running in development/non-production environments, Swagger is available at:

- **Swagger UI:** `http://localhost:<PORT>/v1/swagger`
- **OpenAPI JSON:** `http://localhost:<PORT>/v1/swagger-json`

---

## Testing, Linting & Formatting

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Test coverage
yarn test:cov

# End-to-end tests
yarn test:e2e

# Lint & auto-fix
yarn lint

# Format code with Prettier
yarn format
```
