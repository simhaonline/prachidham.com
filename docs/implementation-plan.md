# Prachi Dham foundation implementation plan

**Goal:** Deliver a portable, Docker-ready internal operations foundation with secure organization-scoped records and approval workflows, not a falsely complete 17-suite ERP.

**Architecture:** Next.js acts as the private UI/BFF rewrite layer. NestJS is the only public application API and owns all PostgreSQL writes, session authorization, record catalog and audit. Python and Go are internal token-protected specialist services; PostgreSQL bundles TimescaleDB and pgvector; Valkey supports login throttling.

**Tech stack:** Next.js, NestJS, TypeScript, PostgreSQL/TimescaleDB/pgvector, Valkey, FastAPI/Python, Go standard library, Docker Compose.

**Spec:** [Foundation specification](spec.md) and [capability map](capability-map.md).

## Global constraints
- The user explicitly requested Go, Python, Node.js, Next.js, NestJS, PostgreSQL with TimescaleDB and pgvector, Valkey, Docker.
- Build in the sandbox only; the desktop mount is inaccessible until Manus Desktop is updated and reconnected.
- Do not use real donor/beneficiary records or ship sample credentials; never assert production compliance.
- Private responses use `Cache-Control: no-store`; browser calls use same-origin `/api/v1` rewrites.

## Review focus
- Missing/forged session must not disclose data; test unauthorized case.
- Unknown module, invalid input and oversized payload must fail without SQL injection; test validation.
- Unauthorized role or cross-organization record ID must not mutate/read another tenant; test policy and repository filtering.
- Invalid workflow transition or wrong role must be rejected and audited only on success; test transition logic.
- Misconfigured optional AI provider/internal token must fail closed; test service behavior.

## Files and responsibilities
- `infra/postgres/001_init.sql`: extensions and durable schema.
- `apps/api/src/{catalog,policy,auth,records,dashboard,proxy}.ts`: registry, role policy, session authentication, record operations, overview, service gateways.
- `apps/api/src/bootstrap.ts`: explicit first-admin initialization.
- `services/intelligence/{main.py,test_main.py}`: guarded AI summary adapter.
- `services/geo/{main.go,main_test.go}`: validated distance endpoint.
- `apps/web/app/{page.tsx,layout.tsx,globals.css}` and client components: authenticated branded UI and module workspaces.
- `compose.yaml`, `Dockerfile`s, `README.md`: reproducible stack and honest deployment instructions.

## Build sequence
1. Write tests for policy/validation/transition behavior and observe failures. Implement catalog, role permissions, record validation and transition function.
2. Build schema, session hashing/origin validation, authenticated endpoints, audit, pagination and bootstrap. Run API tests/build.
3. Write failing Python and Go tests; implement protected AI and geo APIs. Run respective tests.
4. Wire Compose and env example; build branded Next UI, ensure API contracts and empty states, run web build.
5. Run all available checks, inspect source/manifest for sensitive defaults, package repository and report Docker runtime limitation.

## Out of scope in first increment
Posting donations, general ledger, payroll, object uploads, beneficiary case management, marketing sends, public CMS publishing, full search/GEO integration, SSO/MFA and regulatory certification. These require explicit domain and compliance decisions.
