# Foundation specification — Prachi Dham Operations

## Objective
Provide Prachi Dham Foundation staff an organization-scoped operational home where they can authenticate, find domain workspaces, create and update constituents/programs/grants and other module records, submit and decide approval requests, and see accurate live activity. This is an initial deployable foundation for the larger platform, **not a representation that all 17 enterprise systems are fully built**.

## Explicit assumptions
- Single foundation organization initially; the schema and service boundaries allow additional organizations later.
- The first release began as an internal staff app. It now includes a **Gujarati/Hindi/English public review site** (`/` → `/gu`) and an editorial product/service catalog; staff access remains at `/staff`. See [the public-site addendum](spec-public-home.md) and [reference assessment](reference-assessment.md). It is not a donor portal, payment collection system, complete CMS or source of bulk-imported beneficiary data.
- Roles: owner, admin, manager, staff, viewer. Viewers cannot mutate; sensitive CRM/HRMS/CDP records are not visible to viewers. Only managers and above may write finance/ERP records or approve workflows.
- The **catalog only** uses INR paise for published item amounts. Accounting jurisdiction, tax, shipping and payment rules remain unset. No financial-reporting, payroll, medical, or privacy-law compliance is implied by this starter.
- “PgVictor” in the request is interpreted as **pgvector**. The database enables TimescaleDB and vector extensions, but production embedding generation and semantic retrieval need a later contract.
- AI uses an optional OpenAI-compatible provider. No model call is made without configured credentials and an authorized user. The UI never auto-populates a prompt from constituent records and warns against sensitive text; staff must exclude personal information from notes they submit.
- Demo/seed accounts are **not** shipped. A bootstrap CLI takes credentials from environment variables and hashes the password; no login can succeed before bootstrap.

## In-scope outcomes
1. Next.js UI uses the supplied logo and a responsive, accessible, sober operations design. Login, overview, module catalog, record list/form, and BPM transition actions work against the API. Empty states report zero rather than invented metrics.
2. NestJS `/v1` API authenticates via an HttpOnly session cookie backed by an opaque random token and hashed storage, enforces unsafe-request Origin checks and Valkey-backed account/global login limits independent of client-provided IPs, applies role permissions and organization scoping to every record query, writes an audit event for mutation, validates input and paginates collections.
3. PostgreSQL schema has organizations, users, sessions, records and audit events protected from UPDATE/DELETE by the restricted application role and trigger (not tamper-proof against database administrators); audit time series uses a TimescaleDB hypertable; a vector column exists for future per-record embeddings. Compose wires PostgreSQL, Valkey, API, web, Python intelligence and Go geo.
4. Python intelligence service provides a protected, optional summary endpoint; it refuses without a service token or provider key. Go geo service validates coordinates and calculates great-circle distances. Nest exposes authenticated proxies rather than browser-to-internal-service access.
5. Docs describe run/bootstrapping, backup/migration limitations, secrets and unimplemented production concerns. Tests prove high-risk policies, auth verification, workflow transitions and geospatial calculations; builds/type checks run where toolchains are available.

## Commands
- Install JS dependencies: `pnpm install`
- Dev: `pnpm --filter @prachi/api dev` and `pnpm --filter @prachi/web dev`
- JS checks: `pnpm --filter @prachi/api test && pnpm --filter @prachi/web test && pnpm --filter @prachi/api build && pnpm --filter @prachi/web build`
- Python tests: `python3 -m pytest -q services/intelligence/test_main.py`
- Go tests: `cd services/geo && go test ./...`
- Full Docker dev stack: `docker compose up --build -d` (on a Docker-capable host)
- Bootstrap first admin: export `ADMIN_EMAIL` and `ADMIN_PASSWORD` outside shell history, then `docker compose exec -e ADMIN_EMAIL -e ADMIN_PASSWORD api node apps/api/dist/src/bootstrap.js` (see README).

## Structure
`apps/web`: localized Next.js public UI, PWA, staff portal and brand assets; `apps/api`: NestJS API, catalog/inquiries and bootstrap; `services/intelligence`: optional FastAPI adapter; `services/geo`: Go calculations; `infra/postgres`: initialization and additive migration SQL; `docs`: specifications, source assessment, API and operations notes.

## Style and interfaces
TypeScript uses strict mode and camelCase JSON. SQL tables/columns are snake_case. API resources are `/v1/modules/{moduleKey}/records`; requests are validated and errors use a stable problem envelope. Example policy: `canAccess('viewer', 'crm', 'read') === false`; inaccessible records return not-found rather than leaking other organizations' IDs.

## Testing and boundaries
- Always: validate inputs, scope SQL by organization, hash secrets, test policies and transitions, handle empty/unavailable services.
- Resolve before production: approved program/product/service content and translations, real prices and sale/donation rules, privacy/retention and residency, host/DNS access, sensitive-data controls and payment/marketing provider verification. Do not import real beneficiary data or enable a checkout by assuming these have been approved.
- Never: commit provider keys, seed hard-coded passwords, claim accounting or compliance certification, use mock donation totals as live data.
- Tests are unit/integration-style for core policy and service functions, plus build/static checks. Container runtime verification is required on a Docker host before live deployment.

## Success criteria
Unauthenticated private API requests get 401; invalid origin on mutation gets 403; viewers cannot see sensitive workspaces or mutate; org A cannot read/change org B records; a staff member can create an allowed record; a manager can approve submitted BPM requests while staff cannot; dashboard counts match stored rows; absent AI credentials fail clearly; invalid latitude fails; UI builds without type errors. These criteria cover foundation behavior only.

## Open decisions for production
Exact legal entity/jurisdiction and privacy law, supported language(s), data residency and retention, identity provider/SSO/MFA, approval matrices, grants/accounting rules, donor payment processor, file storage and antivirus, map provider, messaging consent requirements, external integrations and deployment cloud.
