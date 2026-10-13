# Public Homepage and Self-Hosting Implementation Plan

> **For agentic workers:** Use test-first implementation in this repository; preserve the existing staff application and its security boundary. Steps use checkboxes for tracking.

**Goal:** Give Prachi Dham Foundation an honest public homepage at `/` and retain the staff platform at `/staff`, with a self-hosting deployment path ready for the user's server details.

**Architecture:** One Next.js application serves public HTML and the private staff shell; Nest remains behind same-origin `/api/v1/*`. A Compose production overlay places a TLS reverse proxy in front of Next, while database, cache and specialist services stay unexposed. Deployment is pending host/domain/approved content.

**Tech stack:** Existing Next.js 15, NestJS, PostgreSQL/TimescaleDB/pgvector, Valkey, Go and Python services; Docker Compose; Caddy as the self-hosted TLS reverse proxy.

**Spec:** `docs/spec-public-home.md`

## Global constraints

- Use the supplied `apps/web/public/brand/logo.png` and existing `docs/brand-spec.md` tokens; do not present unverified mission, program, donation, contact or impact claims as fact.
- Preserve internal session cookies, staff UI, `/api/v1/*` contract, audit and role/tenant restrictions.
- No new Manus-managed project or upload: the user chose self-hosting. No writes to the incompatible Windows mount.
- Do not configure a guessed public origin or publish; infrastructure details and content approval are pending.

## Review focus

- Anonymous `/` has meaningful server HTML without private data; `/staff` preserves login and dashboard.
- Direct `/staff` and static asset requests work on refresh; missing API endpoints do not become a 200 HTML page.
- Search crawlers get useful homepage metadata but no private route in sitemap; unknown canonical origin is omitted.
- Proxy trusts exact host and forwards original HTTPS information without exposing DB/cache/API ports.
- Domain/secret absence causes configuration validation failure, not accidental public HTTP or guessed contact details.

## Design direction

Mode: **Extension** of the existing brand system, not an operations UI redesign. Preserve logo, deep forest `#123229`, parchment `#f7f5ef`, muted gold `#ad8750`, Georgia serif and 8px spacing rhythm. Public page: warm institutional editorial, visual variance 4/10, motion 1/10, density 4/10, asset dependence 2/10, brand fidelity 10/10. Hero is a clear introduction at phone/laptop distance rather than a fictitious programs page. No third-party photo because the available Prachi travel images are unlicensed for reuse and do not depict foundation work. Existing staff design remains unchanged.

## Tasks

### Task 1: Public route and protected staff route

**Files:** Replace `apps/web/app/page.tsx`; add `apps/web/app/staff/page.tsx` and `apps/web/app/public-home.css`; add focused tests under `apps/web/test/`.

**Interface:** `GET /` returns public foundation copy and a working `/staff` link. `GET /staff` returns the existing `OperationsApp` and continues to call `/api/v1/*`.

- [x] Write a failing test for public page markup and absence of the staff shell; observe the expected failure.
- [x] Add a regression assertion that staff route still renders the session-aware `OperationsApp` shell (added after route migration; not a red-green test).
- [x] Add minimal routes and scoped CSS without rewriting staff components; verify web tests and type checking.
- [x] Commit the isolated route change (`5491c97`).

### Task 2: Public search boundary

**Files:** Change `apps/web/app/layout.tsx`; add `apps/web/app/staff/layout.tsx`, `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`; add `apps/web/lib/site-origin.ts` and tests.

**Interface:** `PUBLIC_SITE_ORIGIN` is optional in development and required for final production publish. It is a configured HTTPS origin, not request-derived. Unconfigured canonical/OG URL/sitemap entries are absent; staff metadata is noindex/nofollow. The independent `PUBLIC_SITE_INDEXABLE=true` build flag is required before the public page, robots rules and sitemap become indexable. Robots excludes `/staff` and `/api` in this state.

- [x] Write failing metadata/origin and indexability tests for valid, absent and invalid origins and staff isolation; observe expected failures.
- [x] Implement framework metadata/robots/sitemap behavior and pass web tests, TypeScript and production build.
- [x] Stage and verify the independent SEO/security boundary for the delivery commit.

### Task 3: Self-hosted production overlay and runbook

**Files:** Add `infra/proxy/Caddyfile`, `compose.production.yaml`, `docs/self-hosting.md`; update `.env.example` and `README.md` only where necessary.

**Interface:** Production Compose overlay removes the base direct web port, adds Caddy with 80/443, proxying to internal Next web; environment supplies approved hostname and optional HTTPS site origin. Existing API/DB/cache/specialists stay private. Caddy manages certificates when DNS points to the host.

- [x] Add config smoke check (`docker compose -f compose.yaml -f compose.production.yaml config --quiet` with dummy non-secret env), and inspect the rendered port bindings; observed the expected missing-file failure before the overlay existed.
- [x] Add overlay, Caddyfile and a concise runbook for DNS, TLS, secrets, role bootstrap, backups, restore test, logging and data residency decisions. No real host changes.
- [x] Re-run Compose syntax/config checks and existing JS/Python/Go checks; stage the validated deployment reference for the delivery commit. A clean-volume Docker boot still requires the user's host.

### Task 4: Verify and hand off

- [x] Use the local sandbox URL only as a **preview**, not a permanent host. Verified raw HTML of `/`, private route behavior, 404 handling, health and anonymous API behavior; the `/staff` login form was visually checked, but a new authenticated login after the route move is still to be checked.
- [ ] Review changed files and exclude secrets/build output; package a source archive and hand off the exact pending host, domain, DNS/TLS and approved-copy decisions.
- [ ] When access and approved content arrive, configure the actual self-hosted server, test clean-volume Compose and backups, then request final public publication confirmation with the exact payload before exposing the site.
