# Prachi Dham Foundation — public site and operations platform

A portable first-release foundation for a multilingual nonprofit website and staff operations. The stack is **Next.js, NestJS/Node.js, PostgreSQL with TimescaleDB and pgvector, Valkey, Python/FastAPI, Go, Docker Compose and Caddy**. It is not yet the complete 17-system platform described in the project briefs.

**Deployment status:** Source and a temporary sandbox preview exist. **No permanent server or custom domain has been deployed.** The Foundation chose its own infrastructure; host and DNS access are still required. Read the [build report](docs/build-report.md) for a capability-by-capability account and the [self-hosting runbook](docs/self-hosting.md) for operations and upgrades.

## What is built

| Surface | Working capability | Not included |
|---|---|---|
| Public site | Gujarati `/gu` (default), Hindi `/hi` and English `/en` home, shop, services and contact routes | Approved final public content and public indexing |
| Catalog | Tenant-scoped product/service drafts, INR paise amounts, owner/admin translation review and publication, public reads of approved listings only | Cart, stock, checkout, payment, shipment, donation processing or receipts |
| Inquiries | Optional consent-gated availability form and staff follow-up, **off by default**; user-initiated email alternative | Sale, booking or payment confirmation |
| Mobile | Logo-derived favicon, Android/Apple icons, installable manifest and public-only offline page | Native app, push notifications or offline staff data |
| Staff | `/staff` sign-in, organization-scoped records, live overview, role controls and BPM approval flow; `/staff/catalog` editorial editor | SSO/MFA, full staff translation, complete finance/HR/case suites |
| Specialist services | Optional protected AI note summary and Go coordinate-distance calculation | Automatic use of constituent PII, map tiles or full geospatial analytics |

The workspace menu names **CRM, ERP, BPM, HRMS, SCM, BI, EAM, PLM, CMS, DMS, ECM, ITS, PSA, CDP, MAP, SEO and GEO**. Most are generic, auditable title/status/notes workspaces—not implementations of full enterprise suites. Only BPM has a dedicated approval transition; the separate catalog has its own schema and review flow. The supplied PDFs were assessed in [reference-assessment.md](docs/reference-assessment.md), but hypothetical donation figures and unapproved legal/tax claims are not published as live results.

## Docker deployment on your server

These steps are for a **new** Linux host and database volume. You need Docker Engine, Docker Compose **v2.24.4 or newer** (the production override uses `!reset`), a public DNS name pointed at the host, inbound TCP **80/443**, sufficient storage for PostgreSQL and an off-host backup plan. Run commands from the extracted repository root on a host you control.

> **Public site and application on different domains?** If `prachidham.com` is a public-facing Plesk host that proxies to an application VPS (for example `platform.prachidham.com`), use the [`compose.split-domain.yaml`](compose.split-domain.yaml) overlay and follow the [split-domain runbook](docs/plesk-deployment.md). If instead a single Plesk host owns 80/443 with no Caddy, use [`compose.plesk.yaml`](compose.plesk.yaml).

1. **Copy the source to the host.** If using the delivered ZIP:

   ```bash
   unzip prachidham-platform-source.zip
   cd prachidham-platform
   docker compose version
   docker info >/dev/null
   ```

2. **Create owner-only configuration.** Edit `.env` with the **bare** `APP_HOST` (for example `www.example.org`, not `https://...`) and independent, high-entropy, URL-safe values for `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `VALKEY_PASSWORD` and `INTERNAL_SERVICE_TOKEN`. `scripts/generate-secrets.sh` writes an owner-only `.env` with four fresh secrets and refuses to overwrite an existing file. Do not commit, paste or email those values. Leave indexing, structured inquiries and AI provider credentials off for the review deployment.

   ```bash
   umask 077
   cp .env.example .env
   chmod 600 .env
   # Open .env in your preferred editor and fill the required values.
   # Keep PUBLIC_SITE_INDEXABLE=false and PUBLIC_COMMERCE_INQUIRIES_ENABLED=false.
   ```

   The production override derives `PUBLIC_APP_ORIGIN` and `PUBLIC_SITE_ORIGIN` from `APP_HOST`. `PUBLIC_REQUIRED_LOCALES=gu,hi,en` means all three translations need review before a catalog item can be published. This reference passes database/cache credentials as environment variables; migrate to a stronger secret-management arrangement before handling sensitive real data.[^1]

3. **Validate and start** the base file followed by the production override. Docker documents this `-f` order for merging a production-specific Compose file.[^2] The merged graph should expose **only Caddy on 80/443**; web, API, PostgreSQL, Valkey, Python and Go remain private. Avoid sharing the full `config` output because it can contain interpolated secrets.

   ```bash
   docker compose -f compose.yaml -f compose.production.yaml config --quiet
   docker compose -f compose.yaml -f compose.production.yaml up --build -d
   docker compose -f compose.yaml -f compose.production.yaml ps
   docker compose -f compose.yaml -f compose.production.yaml logs --tail=100 proxy web api postgres
   ```

   On a **fresh PostgreSQL volume**, the ordered init hooks create the base schema, commerce tables, restricted `prachi_app` role and grants. They do **not** re-run on an existing volume; use the [upgrade procedure](docs/self-hosting.md#3-existing-database-upgrade) instead.

4. **Bootstrap the first owner** once, after the API and database are healthy. Enter a real email and a password of at least 16 characters. The existing email is not overwritten. The password is read interactively rather than typed into shell history.

   ```bash
   read -r -p 'Admin email: ' ADMIN_EMAIL
   read -r -s -p 'Admin password (16+ chars): ' ADMIN_PASSWORD; printf '\n'
   export ADMIN_EMAIL ADMIN_PASSWORD
   docker compose -f compose.yaml -f compose.production.yaml exec \
     -e ADMIN_EMAIL -e ADMIN_PASSWORD api node apps/api/dist/src/bootstrap.js
   unset ADMIN_EMAIL ADMIN_PASSWORD
   ```

5. **Verify HTTPS and access** after DNS resolves and Caddy has issued a certificate. Replace `YOUR_HOST` below with the configured domain. A draft deployment intentionally has no public indexable content or active structured inquiry.

   ```bash
   curl -fsS https://YOUR_HOST/api/v1/health
   curl -fsS https://YOUR_HOST/api/v1/catalog/config
   curl -I https://YOUR_HOST/gu
   curl -I https://YOUR_HOST/hi/shop
   curl -I https://YOUR_HOST/en/contact
   curl -fsS https://YOUR_HOST/robots.txt
   curl -fsS https://YOUR_HOST/site.webmanifest
   ```

   Open `https://YOUR_HOST/staff` to sign in, then `/staff/catalog` as owner/admin to create drafts, review three translations and publish real approved offerings. Expect anonymous `/api/v1/me` and `/api/v1/admin/catalog` to return **401**; the public inquiry endpoint remains **503** while disabled. `PUBLIC_SITE_INDEXABLE=false` keeps draft public pages noindex and the sitemap empty. Do not enable indexing until the Foundation approves the exact three-language copy and listings; the flag is a **web build argument**, so rebuild the web image after changing it.

For ongoing backups, existing-volume migrations, diagnostics and safe updates, follow the [full Docker runbook](docs/self-hosting.md). **Never use `docker compose down -v` on a database you intend to keep**; it deletes named volumes.

## Local Docker preview

For a **local-only** review on a Docker-capable workstation, set the four required secrets in `.env`, leave `PUBLIC_APP_ORIGIN=http://localhost:3000`, then run `docker compose up --build -d`. The base file binds the Next web port to `127.0.0.1:3000` and does not start Caddy. Open `http://localhost:3000/gu` and `http://localhost:3000/staff`. This is not a production TLS deployment.

## Repository and architecture

| Path | Responsibility |
|---|---|
| `apps/web/` | Next.js public languages, staff UI, favicon and PWA assets |
| `apps/api/` | NestJS auth, policies, generic records, catalog, inquiry and audit endpoints |
| `services/intelligence/` | Protected optional FastAPI summary adapter |
| `services/geo/` | Protected Go distance service |
| `infra/postgres/` | Base SQL, commerce migration, role grants and privilege test |
| `infra/proxy/Caddyfile` | Automatic HTTPS reverse proxy and staff/API no-store/noindex headers |
| `compose.yaml`, `compose.production.yaml` | Base services and single-host production override |

Caddy routes the same public HTTPS origin to Next; Next proxies `/api/v1/*` to Nest. Nest alone reaches PostgreSQL, Valkey and internal Python/Go services. PostgreSQL uses the TimescaleDB HA image with pgvector available; the vector column is reserved for future retrieval, **not** a live semantic-search feature. See the [architecture diagram](docs/build-report.md#system-structure) and [API contract](docs/openapi.yaml).

## Development and checks

Node 22 and pnpm are used for the web/API workspaces. Native development requires an initialized PostgreSQL database and `DATABASE_URL`; optional Python/Go services can run independently. Set `PUBLIC_APP_ORIGIN=http://localhost:3000`, start `pnpm --filter @prachi/api dev` and `pnpm --filter @prachi/web dev`, and use the Next `/api/v1/*` proxy (`API_INTERNAL_URL` defaults to `http://127.0.0.1:4000`).

```bash
pnpm install --frozen-lockfile
pnpm --filter @prachi/api test
pnpm --filter @prachi/web test
pnpm --filter @prachi/api build
pnpm --filter @prachi/web build
python3 -m pytest -q services/intelligence/test_main.py
(cd services/geo && go test ./... && go vet ./...)
pnpm audit --prod --audit-level high
```

With an initialized database, run `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f infra/postgres/test_runtime_privileges.sql` as the restricted `prachi_app` role. See [the build report](docs/build-report.md#verification-performed) for what was actually verified; a complete Docker startup still needs testing on the chosen host.

## Known limits and next steps

- **No payment gateway:** Razorpay appears in the briefs, but merchant credentials, signed webhook processing, tax/shipping/refund rules and reconciliation are not implemented. An inquiry is not an order or donation.
- **No production security sign-off:** The app has organization-scoped queries and a restricted DB role, but not database row-level security, SSO/MFA, field-level access, full PII handling, retention/deletion automation or demonstrated disaster recovery. Do not import sensitive beneficiary, health or financial records without those controls.
- **No real production deployment:** The server/domain/DNS information has not been provided; the sandbox URL is temporary. Move this source to the approved Linux host, validate backup/restore and TLS, then review exact content before enabling search indexing or collection of contact information.
- **Desktop working copy unchanged:** The connected Windows Manus Desktop operator must be updated and reconnected before using Work Locally with that mounted directory. This repository was built in the sandbox instead.

[^1]: Docker, “Manage secrets securely in Docker Compose.” https://docs.docker.com/compose/how-tos/use-secrets/
[^2]: Docker, “Use Compose in production” and “Merge Compose files.” https://docs.docker.com/compose/how-tos/production/ and https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
