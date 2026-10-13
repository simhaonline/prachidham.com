# Prachi Dham Foundation — delivery status

**As of 1 October 2026.** This is a reviewed source increment and temporary preview, **not a permanently deployed website or the complete 51-page platform**. No subagents were launched for this increment; the earlier sandbox-only preview services were stopped before the new temporary preview was started. The Windows working copy was not touched because Manus Desktop must be updated and reconnected for Work Locally compatibility.

## Delivered now

- **Public pages:** `/` redirects to Gujarati `/gu`; `/hi` and `/en` have translated home, product, service and contact pages. Language links, semantic page titles, document `lang`, noindex-by-default metadata, canonical/hreflang when approved, localized sitemap and accessible mobile layout are implemented. Approved catalog entries have per-language slugs; unavailable languages do not display unreviewed text.
- **Commerce foundation:** PostgreSQL migration for tenant-scoped product/service drafts, INR paise pricing, reviewed translations and inquiries. Owner/admin staff editor at `/staff/catalog` supports drafts, translations, approval, explicit publication/unpublication and inquiry follow-up; changes are audited. Public views are backed by real approved records, with an accurate empty state before content is approved.
- **Inquiry safety:** The structured contact form is **off by default**. It requires an HTTPS privacy-policy URL, approved version and explicit opt-in before contact data is collected; production requests are rate-limited by Valkey and server-read prices. A visitor can otherwise initiate an email inquiry from a published listing. There is **no cart, checkout, payment, booking, shipping, donation processing or tax receipt**.
- **Mobile/PWA:** The supplied 300×314 logo produced a compact favicon, Apple icon, Android 192/512 icons and install manifest. A public-only service worker caches installation images and a trilingual offline page; it does not cache staff, API, catalog detail, form submissions or query data.
- **Reference assessment:** All nine provided PDFs (104 pages) were checked; no legal originals or personal identifier scans are in the source archive. The two seva totals represent different hypothetical bases, not donations received. Constitutional objects are not presented as executed programs.

## Verification evidence

| Check | Result |
|---|---|
| Nest API tests and production build/type check | 27 passed; build/type check passed |
| Next public/staff tests and production build/type check | 24 passed; build/type check passed |
| FastAPI tests and Go tests/vet | 5 Python tests passed; Go checks passed |
| Dependency audit | No known high-severity production advisories |
| Database migration, API role and publication flow | Migration/grants applied on a disposable local PostgreSQL instance; restricted-role test passed; API draft → three approvals → publish → per-locale public visibility → unpublish passed and disposable item/session were removed |
| Public API/security | Anonymous admin returned 401; inquiry POST returned 503 while disabled; public catalog/config returned 200 |
| Production-mode preview | Local and public sandbox URLs served all three language roots, shop/services/contact, staff, API health, manifest, worker and favicon; raw HTML `lang` and draft `noindex` verified; desktop/mobile screenshots inspected |
| Deployment reference | Compose merge, Caddy config and OpenAPI 3.1 schema validated. The OpenAPI linter reports 35 style/completeness warnings, no errors. No Docker daemon was available to run the six-container stack in this sandbox. |

## Local stack verification — 12 October 2026

The six-container Compose stack was **built and run together** on a Docker-capable host for the first time. PostgreSQL/TimescaleDB/pgvector, Valkey, API, web, Python and Go services reached healthy; the ordered init hooks created all nine tables, the `audit_events` TimescaleDB hypertable and the restricted `prachi_app` role; the privilege regression test passed.

Verified end to end through the Next `/api/v1` proxy: health and public catalog/config `200`; public catalog empty before publication; anonymous `/api/v1/me` and `/api/v1/admin/catalog` `401`; inquiry POST `503` while disabled (and `403` on a forged Origin); owner bootstrap and login; organization-scoped record create/list; BPM `draft → submitted → approved`; and a full catalog `draft → three reviewed translations → publish → public read → edit-unpublishes` lifecycle with audit events recorded. The restricted role was confirmed append-only on `audit_events` (INSERT only; UPDATE/DELETE denied).

One defect was found and fixed: `RateLimitService` connected to Valkey lazily and two concurrent checks (login and inquiry each run account + global checks together) raced, so the **first** rate-limited request after API start returned `503`. It now shares a single connection attempt and lets the initial command queue; a regression test was added. The merged production Compose graph was confirmed to publish **only** Caddy on 80/443, and the Caddyfile validated with `caddy validate`.

## What is still required for a **permanent site on your infrastructure**

1. **Infrastructure details:** Linux server/cloud provider and OS, access method (SSH or provider connector), the public domain/DNS owner, whether ports 80/443 can be routed, and where encrypted backups should go. Do not send passwords or private keys in chat; use existing configured secure access or your own secret store.
2. **Editorial approvals:** exact homepage/program and contact wording in Gujarati, Hindi and English; real product/service titles, approved descriptions, SKUs, INR amounts, availability, images and publication rules. Professional language and religious/legal review are recommended before indexing.
3. **Commerce/legal decisions:** privacy policy, consent/retention workflow, taxes, fulfillment/refunds and whether donations or sponsorships may be collected. Razorpay is named in the briefs but payment onboarding, signed webhooks, financial reconciliation and any 80G representations are **not implemented or approved**.
4. **Production hardening:** complete staff-app localization; SSO/MFA, account lifecycle, row/field-level access for sensitive data, encryption/backups/restore drills, observability and real-domain TLS/host smoke tests. The 17 requested enterprise modules remain generic workspaces, not full vertical suites.

The [self-hosting runbook](self-hosting.md) gives the ordered deployment and migration commands. **Do not switch the domain or enable public indexing/inquiries until the above decisions are made and verified on the actual host.**
