# Public homepage and self-hosted staff platform — specification

## Intent

Prachi Dham Foundation wants both a public-facing homepage and a permanently available private staff platform. The user chose **their own infrastructure** for both. This repository remains the portable Next.js/NestJS/Python/Go/PostgreSQL/TimescaleDB/pgvector/Valkey platform; the sandbox preview is not production hosting.

## Immediately buildable scope

The Next.js root `/` redirects to the Gujarati homepage at `/gu`, with `/hi` and `/en` for Hindi and English. The public site uses the supplied logo and forest/parchment/gold identity. Its copy identifies the foundation and Gir Somnath, Gujarat without inventing operational programs, impact metrics, donor appeals, donation URLs, approvals or legal assurances. Contact details are sourced from the user-supplied website prompt but still need foundation sign-off. The existing staff experience remains at `/staff`; `/staff/catalog` adds owner/admin editorial controls. API calls remain at `/api/v1/*`, backed by Nest, and all private records stay server-authenticated.

Public HTML provides a meaningful `<main>`, headings, navigation, footer and working staff-login link. Each language has its own URL, document `lang`, metadata, canonical and hreflang; untranslated catalog items are hidden. The staff route uses `noindex, nofollow`; robots disallows `/staff` and `/api` when indexing is enabled. Canonical/OG URLs are emitted only when a real `PUBLIC_SITE_ORIGIN` is configured, never derived from request headers. A separate default-off `PUBLIC_SITE_INDEXABLE=true` build setting is required for public indexing and the trilingual sitemap. The optional availability inquiry collects name/email **only** after a separately approved HTTPS privacy policy/version and feature flag; it never charges or books. No cross-site cookie or CORS behavior is introduced. A public-only PWA offline screen stores no private API or catalog data.

## Self-hosting deliverable

A production overlay provides reverse proxy routing and HTTPS for the user's domain, with only ports 80/443 externally reachable. The existing Compose stack retains private database/cache/Python/Go networks. Proxying `/staff` and `/api/v1` to the Next web service preserves same-origin session-cookie behavior. The overlay must not ship a real secret, domain guess or real-data backup. A runbook documents DNS, TLS, distinct application/migration passwords, first administrator, backups, recovery and the limits of this reference stack. Server and DNS actions wait for access and ownership details.

## Still needed from the foundation

The user will provide infrastructure access, public/staff hostnames, DNS/TLS ownership, approved mission/program/contact/donation details, and approval of final public wording. Without those, do not call a temporary sandbox URL a permanent deployment, publish invented copy, or import real constituent data. Existing Windows-mounted working copy is inaccessible until Manus Desktop is updated and reconnected.
