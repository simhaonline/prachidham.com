# Deploying behind a Plesk reverse proxy

This runbook covers a **VPS that is managed by Plesk** where `prachidham.com` is
hosted. Plesk's own nginx already owns inbound TCP **80/443**, so the repository's
Caddy service **must not be started** — it would fail to bind those ports. Plesk
terminates TLS and reverse-proxies to the `web` container, which stays bound to
`127.0.0.1:${WEB_PORT}` (default `3000`).

The application itself is unchanged: PostgreSQL/TimescaleDB, Valkey, the NestJS
API, the Next.js web app, and the optional Python and Go services all run exactly
as in the standard Docker deployment. Only the edge changes: **Plesk nginx
replaces Caddy**.

> **Why not run everything inside Plesk's Node.js hosting?** The platform needs
> TimescaleDB and pgvector (only available in the `timescale/timescaledb-ha`
> image), a Redis/Valkey instance, and — for the optional features — a Python and
> a Go runtime. Plesk shared hosting provides none of those. Running the stack in
> Docker on the Plesk VPS keeps every feature and needs no code changes.

## 0. Prerequisites

- A VPS with **Docker Engine** and **Docker Compose v2.24.4+** (the overlay uses
  `!reset`; this runbook's overlay does not, but the base/production files do).
- Plesk installed on the same host, managing `prachidham.com`, with its nginx
  running. **Do not** install the Plesk Docker extension's own proxy for this
  domain — we drive nginx directly.
- DNS: an `A`/`AAAA` record for `prachidham.com` pointing at the VPS.
- Root SSH (or a sudo-capable user in the `docker` group).
- Free localhost port `3000` on the VPS (change `WEB_PORT` in `.env` if taken).

Confirm the base prerequisites:

```sh
docker compose version   # must be >= v2.24.4
docker info >/dev/null   # daemon reachable
ss -ltnp | grep -E ':(80|443)\b'   # should show Plesk's nginx, not Caddy
```

## 1. Put the reviewed source on the VPS

Clone the reviewed revision (Git deploy):

```sh
git clone <your-remote-url> /opt/prachidham-platform
cd /opt/prachidham-platform
```

If there is no remote yet, create one, push `master`, and clone that — do not
copy a working tree that contains a populated `.env`.

## 2. Create the owner-only configuration

```sh
umask 077
./scripts/generate-secrets.sh      # writes a 600 .env with four fresh secrets
```

Edit `.env` and set the Plesk hostname (bare DNS name, no scheme):

```ini
PUBLIC_SITE_HOST=prachidham.com
PUBLIC_SITE_INDEXABLE=false
PUBLIC_REQUIRED_LOCALES=gu,hi,en
PUBLIC_COMMERCE_INQUIRIES_ENABLED=false
COMMERCE_POLICY_VERSION=
PUBLIC_PRIVACY_POLICY_URL=
WEB_PORT=3000
```

Leave indexing and structured inquiries **off** until the Foundation approves the
exact three-language copy, real SKUs/prices and a privacy notice. The overlay
derives `PUBLIC_APP_ORIGIN` and `PUBLIC_SITE_ORIGIN` from `PUBLIC_SITE_HOST`, so
`PUBLIC_APP_ORIGIN` in `.env` is ignored here.

Keep `.env` out of Git and back the secrets up separately.

## 3. Validate and start the stack

```sh
docker compose -f compose.yaml -f compose.plesk.yaml config --quiet
docker compose -f compose.yaml -f compose.plesk.yaml up --build -d
docker compose -f compose.yaml -f compose.plesk.yaml ps
docker compose -f compose.yaml -f compose.plesk.yaml logs --tail=100 web api postgres
```

Expected after startup:

- `web` is the **only** service publishing a port, and only on loopback:
  `127.0.0.1:3000->3000/tcp`.
- There is **no** `proxy` service (Caddy is intentionally absent).
- On a **fresh** database volume the ordered init hooks
  (`001_init.sql`, `020_commerce.sql`, `030_runtime_role.sh`,
  `040_commerce_grants.sql`) create the schema and the restricted `prachi_app`
  role. They do not re-run on an existing volume.

Confirm the web app answers locally before touching Plesk:

```sh
curl -fsS http://127.0.0.1:3000/api/v1/health
curl -I   http://127.0.0.1:3000/gu
```

## 4. Bootstrap the first owner

Enter a **real email** and a password of **at least 16 characters** (the login
validator additionally requires ≥ 12). The password is read interactively so it
never lands in shell history or a file. The email is not overwritten if it
already exists.

```sh
read -r -p 'Admin email: ' ADMIN_EMAIL                 # admin@prachidham.com
read -r -s -p 'Admin password (16+ chars): ' ADMIN_PASSWORD; printf '\n'
export ADMIN_EMAIL ADMIN_PASSWORD
docker compose -f compose.yaml -f compose.plesk.yaml exec \
  -e ADMIN_EMAIL -e ADMIN_PASSWORD api node apps/api/dist/src/bootstrap.js
unset ADMIN_EMAIL ADMIN_PASSWORD
```

Expected output: `Bootstrap complete; existing accounts were not changed.`

## 5. Point Plesk's nginx at the web container

In Plesk for **prachidham.com**:

1. **Apache & nginx Settings → uncheck "Proxy mode"** so nginx serves the domain
   directly instead of proxying to Apache. This removes Plesk's own `location /`,
   which would otherwise collide with the block below.
2. Paste the following into **Additional nginx directives**:

   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_read_timeout 60s;
       proxy_send_timeout 60s;
   }

   # Private surfaces keep the headers the Caddyfile used to add.
   location ~ ^/(staff|api)(/|$) {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       add_header Cache-Control "private, no-store" always;
       add_header X-Robots-Tag "noindex, nofollow" always;
   }
   ```

   Regex locations are evaluated before the `location /` prefix, so `/staff` and
   `/api/*` receive the private headers while everything else is a plain proxy.
   All paths go to the **same** origin (`prachidham.com`), which is required: the
   API sets the HttpOnly `pd_session` cookie and the `OriginGuard` compares the
   request `Origin` against `PUBLIC_APP_ORIGIN=https://prachidham.com`.

3. **SSL/TLS Certificates → Install a free Let's Encrypt certificate** for
   `prachidham.com`. Enable the **301 HTTP→HTTPS** redirect.

If your Plesk version does not let you disable proxy mode, use Plesk's **Docker**
extension to define a proxy rule to `127.0.0.1:3000` for this domain instead, and
keep the private-header block above in the same directives field.

## 6. Verify

```sh
curl -I  https://prachidham.com/gu
curl -I  https://prachidham.com/hi/shop
curl -I  https://prachidham.com/en/contact
curl -I  https://prachidham.com/staff
curl -fsS https://prachidham.com/api/v1/health
curl -fsS https://prachidham.com/api/v1/catalog/config
curl -fsS https://prachidham.com/robots.txt
```

Expected:

- `/`, `/gu`, `/hi`, `/en` pages return `200`; `/` redirects to `/gu`.
- `/staff` and `/api/*` carry `Cache-Control: private, no-store` and
  `X-Robots-Tag: noindex, nofollow`.
- Anonymous `/api/v1/me` and `/api/v1/admin/catalog` return **401**.
- The public inquiry endpoint returns **503** while
  `PUBLIC_COMMERCE_INQUIRIES_ENABLED=false`.
- During draft review, `robots.txt` is disallow-all and `sitemap.xml` is empty —
  this is intentional.

Confirm the container is **not** reachable from outside the VPS:

```sh
# from another machine: connection refused is correct
curl -m 5 http://<VPS_PUBLIC_IP>:3000/gu
```

Open `https://prachidham.com/staff`, sign in, then use `/staff/catalog` to create
drafts, review the three translations and publish real approved offerings.

## 7. Updating

```sh
cd /opt/prachidham-platform
git pull
docker compose -f compose.yaml -f compose.plesk.yaml up --build -d
docker compose -f compose.yaml -f compose.plesk.yaml ps
docker compose -f compose.yaml -f compose.plesk.yaml logs --tail=100 web api
```

Back up and test-restore PostgreSQL first. `PUBLIC_SITE_INDEXABLE` is a **web
build argument**, so enabling indexing later requires a web rebuild, not just an
`.env` edit. Never run `docker compose down -v` against a database you intend to
keep.

## 8. Troubleshooting

| Symptom | Check | Action |
|---|---|---|
| Caddy fails to bind `:80/:443` | You started the wrong overlay | Use `compose.plesk.yaml`, **not** `compose.production.yaml` |
| nginx: `duplicate location "/"` | Plesk proxy mode is still on | Disable "Proxy mode" in Apache & nginx Settings, then reload |
| 502 from Plesk nginx | `curl http://127.0.0.1:3000/` on the VPS | Container down or `WEB_PORT` mismatch — check `ps` and `.env` |
| Login returns 403 | Request `Origin` missing/forged | The browser must reach the site at `https://prachidham.com`; the API rejects requests without a trusted `Origin` |
| Login returns 503 | Valkey unhealthy or `NODE_ENV=production` with no `VALKEY_URL` | Check the `valkey` service; production rate limiting is fail-closed by design |
| Inquiry returns 503 | `PUBLIC_COMMERCE_INQUIRIES_ENABLED=false` or policy/version blank | Expected until the privacy notice and retention workflow are approved |
| `postgres`/`api` not healthy | `logs --tail=100 postgres api` | Diagnose migrations/credentials/volume ownership; do **not** erase volumes to go green |

For the full operational policy (backups, restore drills, secret management,
security limits) see [self-hosting.md](self-hosting.md).
