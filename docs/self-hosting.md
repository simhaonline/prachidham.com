# Self-hosting Prachi Dham Foundation

**This repository is a deployment reference, not an already deployed permanent site.** The temporary sandbox preview is not durable hosting. The Foundation chose its own infrastructure but has not yet provided a host, domain/DNS access or SSH/cloud access. The reference uses **one HTTPS hostname**: `/` redirects to `/gu`, `/en` and `/hi` are alternatives, `/[locale]/shop`, `/[locale]/services`, `/[locale]/contact` are public, and `/staff` and `/staff/catalog` are private. `/api/v1/*` stays same-origin behind Next.js. Separate staff subdomains require a redesigned cookie/origin/proxy policy.

## 1. Host and publication prerequisites

Use an always-on Linux host you control with Docker Engine and Compose v2.24.4+, DNS A/AAAA under your control, sufficient disk/RAM for six containers and database backups, and inbound TCP 80/443. Restrict SSH, enable host patches and choose the data-residency jurisdiction before importing real data. Only Caddy publishes 80/443 in `compose.production.yaml`; PostgreSQL, Valkey, API, Python, Go and the Next process have **no public ports**. Caddy obtains/renews TLS after DNS is correct. Pin tested container image digests rather than moving tags before production release.

**If the host is managed by Plesk**, Plesk's nginx already owns 80/443 and Caddy cannot bind them. Deploy with the [`compose.plesk.yaml`](../compose.plesk.yaml) overlay and follow [plesk-deployment.md](plesk-deployment.md) instead of the Caddy steps below; the application, database and services are identical.

**Do not enable public indexing or contact-data collection just because TLS works.** The nine supplied PDFs are references, not approval for every program claim, listed amount, legal benefit or product/service sale. Foundation leadership must approve the exact three-language text, contact details, real SKUs/prices and policies. `PUBLIC_SITE_INDEXABLE=false` keeps the public draft noindex, robots disallow-all and sitemap empty by default.

## 2. Initial deployment on a new database

1. Put the reviewed source on the host. Create a private `.env` (`umask 077; cp .env.example .env; chmod 600 .env`). Set `PUBLIC_SITE_HOST` to the **bare DNS name**, and generate independent, URL-safe high-entropy `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `VALKEY_PASSWORD`, `INTERNAL_SERVICE_TOKEN`. The helper `scripts/generate-secrets.sh` writes an owner-only `.env` with four fresh, URL-safe hex secrets and refuses to overwrite an existing file. The overlay derives `PUBLIC_APP_ORIGIN` and `PUBLIC_SITE_ORIGIN` from the hostname. Avoid URI-reserved characters unless URL-encoded. Keep `.env` out of Git and back up secrets separately.
2. Leave `PUBLIC_SITE_INDEXABLE=false`, `PUBLIC_COMMERCE_INQUIRIES_ENABLED=false`, `COMMERCE_POLICY_VERSION` and `PUBLIC_PRIVACY_POLICY_URL` blank. Leave the optional AI key blank until provider terms and data handling are approved. `PUBLIC_REQUIRED_LOCALES=gu,hi,en` requires all three translation reviews before publication.
3. Verify the merged graph: `docker compose -f compose.yaml -f compose.production.yaml config --quiet`. If you inspect the full rendered `config` to check exposure, do so **only locally** because interpolated secrets may appear; the only published ports should be proxy 80/443. Start with `docker compose -f compose.yaml -f compose.production.yaml up --build -d`; inspect `ps` and `logs --tail=100 proxy web api postgres` using the same `-f` pair.
4. The ordered PostgreSQL init hooks apply **only to a new volume**: `001_init.sql`, `020_commerce.sql`, `030_runtime_role.sh`, `040_commerce_grants.sql`. Bootstrap the owner using the root [README procedure](../README.md#quick-start-on-a-docker-capable-host) with `-f compose.production.yaml` added to every Compose invocation. Never ship the disposable sandbox preview owner/password.
5. Log in at `https://YOUR_HOST/staff`, open `/staff/catalog`, create **draft** product/service entries, add Gujarati/Hindi/English text and slugs, approve each review and publish explicitly. A product requires a price in INR paise; suggested donation amounts in the PDFs are **not** merchandise prices.

## 3. Existing database upgrade

**Take an encrypted PostgreSQL backup and test restore on staging first.** Editing `/docker-entrypoint-initdb.d` does not upgrade an existing volume. Apply the additive migration with the schema-owner role **before** starting the new API image. Example from the repository root on the host:

```sh
docker compose -f compose.yaml -f compose.production.yaml exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U prachi -d prachidham < infra/postgres/020_commerce.sql
docker compose -f compose.yaml -f compose.production.yaml exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U prachi -d prachidham < infra/postgres/040_commerce_grants.sql
docker compose -f compose.yaml -f compose.production.yaml up --build -d
```

These scripts are idempotent for this additive release; **do not** rerun first-admin provisioning or `down -v`. Test the restricted `prachi_app` privileges with `infra/postgres/test_runtime_privileges.sql`. Future schema changes need a tracked migration runner and rollback/restore plan, not only init-file edits.

## 4. Commerce and privacy gates

The public catalog reads **only tenant-owned, published entries with an approved translation in the requested language**. Item edits or translation changes unpublish the entry until reviewed again. The site has no cart/checkout, stock reservation, charge, booking, donation checkout, invoice or tax receipt. A published detail page offers a contact-by-email action. A structured **availability inquiry** form exists but is off by default and is **not an order or payment**.

To enable inquiry collection, first approve/publish an HTTPS privacy policy and a response/retention/deletion process, then set `PUBLIC_COMMERCE_INQUIRIES_ENABLED=true`, a reviewed `COMMERCE_POLICY_VERSION`, and `PUBLIC_PRIVACY_POLICY_URL` in `.env`; redeploy API. Production Valkey must be available for rate limiting. The form requires explicit consent; owner/admin can follow up via `/staff/catalog`. Do not enable it without a policy. Do **not** activate a payment button before real merchant onboarding, test/live credentials, signed and idempotent webhooks, tax/shipping/refund rules, reconciliation and a legal review.

To add a language later: add its typed public messages and label in `apps/web/lib/locales.ts`, add admin editor copy, update `PUBLIC_REQUIRED_LOCALES` after translating existing listings, provide approved translations and run all tests/builds. The database locale codes and sitemap generation accept additional valid codes; do not silently fall back to an unreviewed language.

## 5. Verification and operation

```sh
curl -I https://YOUR_HOST/gu
curl -I https://YOUR_HOST/hi/shop
curl -I https://YOUR_HOST/en/contact
curl -I https://YOUR_HOST/staff/catalog
curl -fsS https://YOUR_HOST/api/v1/health
curl -fsS https://YOUR_HOST/api/v1/catalog/config
curl -fsS https://YOUR_HOST/site.webmanifest
curl -fsS https://YOUR_HOST/sw.js | head -c 100
curl -fsS https://YOUR_HOST/robots.txt
curl -fsS https://YOUR_HOST/sitemap.xml
```

Expect anonymous `/api/v1/admin/catalog` and `/api/v1/me` to return 401. During draft review, public/staff page source has noindex; an empty sitemap and disallow-all robots are intentional. Staff/API responses get Caddy `X-Robots-Tag: noindex, nofollow` and private no-store headers. After **explicit editorial approval**, set `PUBLIC_SITE_INDEXABLE=true`, rebuild the web image (it is a build-time setting), and verify localized canonical/hreflang tags, public-only sitemap and `/staff`/`/api` exclusion. Never assume this switch itself constitutes approval. Test PWA installation from HTTPS on Android and iOS; the worker caches only public installation assets and a generic trilingual offline page, not private routes, API or catalog data. Mobile installability varies by browser.

## 6. Troubleshooting and maintenance

| Symptom | Check | Action |
|---|---|---|
| `PUBLIC_SITE_HOST` or secret not set | `.env` exists in repository root, required values filled, `chmod 600 .env` | Supply a bare DNS name and distinct URL-safe secrets; re-run `config --quiet` |
| `!reset` or Compose parsing fails | `docker compose version` | Upgrade Compose to v2.24.4 or newer; the production override must remove the base web port |
| HTTPS fails or Caddy cannot issue a certificate | Domain A/AAAA resolves to this server; TCP 80/443 open; `logs --tail=100 proxy` | Fix DNS/firewall, then recheck; do not substitute the temporary sandbox URL |
| `postgres` or `api` not healthy | `docker compose -f compose.yaml -f compose.production.yaml ps` and targeted logs | Diagnose migration, DB credentials and volume ownership; **do not** erase volumes to make startup green |
| Existing deployment lacks catalog tables | Database volume predates `020_commerce.sql` | Back up and run the [existing-volume migration](#3-existing-database-upgrade); init mounts are not replayed |
| Public catalog empty | Owner bootstrap, translations approved in all three required locales, explicit publication | Empty is expected until real reviewed offerings exist; do not insert fabricated prices |
| Inquiry returns 503 | `PUBLIC_COMMERCE_INQUIRIES_ENABLED=false` or policy/version missing | Leave disabled until the reviewed privacy notice and retention workflow are in place |
| AI summary returns 503 | Optional provider credentials absent | Core records continue; enable a provider only after data-sharing approval |

For routine updates, back up and test restore first, review migrations and dependency changes, then use `docker compose -f compose.yaml -f compose.production.yaml up --build -d` against the reviewed source. `docker compose -f compose.yaml -f compose.production.yaml ps` and `logs --tail=100` identify unhealthy services. Code rollback alone may not undo a database migration; keep a compatible schema plan and isolated restore environment. **Never run `down -v` on a production database.**

Schedule encrypted off-host database backups/PITR, restore drills and monitoring of disk/WAL, uptime, certificates, rate limiting and audit storage. Do not import sensitive beneficiary, health, financial or payment information until SSO/MFA, field-level access, consent, retention, disaster recovery and independent security/legal reviews exist. No such production controls, live custom domain or host deployment were completed in this sandbox session.
