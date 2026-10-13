# Deploying with the public site and the application on separate domains

This runbook covers a **split-domain** deployment:

- **`prachidham.com`** — the public website. Hosted on a **Plesk** server whose
  nginx terminates TLS. It holds no application code; it reverse-proxies to the
  application host.
- **`platform.prachidham.com`** — the application (staff console + API), running
  the Docker stack on a **VPS**.

```
Browser ──HTTPS──▶ prachidham.com            (Plesk nginx, public site)
                     │  proxy_pass
                     ▼
Browser ──HTTPS──▶ platform.prachidham.com   (VPS: Caddy → web:3000)
                     └── Next.js: public pages + /staff + /api/v1 → api:4000
```

Both hostnames resolve to the **same Next.js process**. The public domain is a
front for it; the staff console is reached directly on the application domain.

> The application itself is unchanged from the standard Docker deployment:
> PostgreSQL/TimescaleDB, Valkey, the NestJS API, the Next.js web app and the
> optional Python and Go services all run exactly as before. Only the edge and
> the origin configuration differ.

## 0. Prerequisites

- **Application VPS**: Docker Engine, Docker Compose **v2.24.4+**, a public DNS
  record for `platform.prachidham.com`, and inbound TCP **80/443** (Caddy needs
  them to obtain a certificate).
- **Public Plesk server**: `prachidham.com` added as a domain, with nginx running
  and a Let's Encrypt certificate installed.
- A Git remote you can clone from (this repository).

```sh
# on the application VPS
docker compose version   # >= v2.24.4
docker info >/dev/null   # daemon reachable
```

## 1. DNS

Both records must exist before starting Caddy, or certificate issuance fails:

| Name | Type | Points to |
|---|---|---|
| `prachidham.com` | `A`/`AAAA` | the **Plesk** server |
| `platform.prachidham.com` | `A`/`AAAA` | the **application VPS** |

## 2. Application host (`platform.prachidham.com`)

Clone the reviewed source and create the owner-only configuration:

```sh
git clone <your-remote-url> /opt/prachidham-platform
cd /opt/prachidham-platform
umask 077
./scripts/generate-secrets.sh      # writes a 600 .env with four fresh secrets
```

Edit `.env` for the split topology:

```ini
APP_HOST=platform.prachidham.com
PUBLIC_SITE_ORIGIN=https://prachidham.com
PUBLIC_APP_ORIGIN=https://platform.prachidham.com
PUBLIC_ALLOWED_ORIGINS=https://prachidham.com,https://platform.prachidham.com

PUBLIC_SITE_INDEXABLE=false
PUBLIC_REQUIRED_LOCALES=gu,hi,en
PUBLIC_COMMERCE_INQUIRIES_ENABLED=false
COMMERCE_POLICY_VERSION=
PUBLIC_PRIVACY_POLICY_URL=
```

- `PUBLIC_SITE_ORIGIN` drives canonical URLs, `hreflang`, the sitemap and Open
  Graph — it must be the **public** origin (`https://prachidham.com`).
- `PUBLIC_APP_ORIGIN` is the origin the browser uses for the staff console; it
  also decides the `Secure` flag on the session cookie.
- `PUBLIC_ALLOWED_ORIGINS` is the allowlist for **mutating** requests. Both
  origins are listed because the public site issues its own same-origin API
  calls through the proxy. If it is left blank the API falls back to
  `PUBLIC_APP_ORIGIN` alone.

Validate and start:

```sh
docker compose -f compose.yaml -f compose.split-domain.yaml config --quiet
docker compose -f compose.yaml -f compose.split-domain.yaml up --build -d
docker compose -f compose.yaml -f compose.split-domain.yaml ps
```

Expected: only the `proxy` service publishes host ports (**80/443**); `web`,
`api`, `postgres`, `valkey`, `intelligence` and `geo` stay private. Caddy obtains
a certificate for `platform.prachidham.com` once DNS resolves.

Confirm locally on the VPS:

```sh
curl -fsS https://platform.prachidham.com/api/v1/health
curl -I   https://platform.prachidham.com/gu
```

## 3. Bootstrap the first owner

The password is read interactively so it never reaches shell history or a file.
Use a real email and a password of **at least 16 characters**.

```sh
read -r -p 'Admin email: ' ADMIN_EMAIL                 # admin@prachidham.com
read -r -s -p 'Admin password (16+ chars): ' ADMIN_PASSWORD; printf '\n'
export ADMIN_EMAIL ADMIN_PASSWORD
docker compose -f compose.yaml -f compose.split-domain.yaml exec \
  -e ADMIN_EMAIL -e ADMIN_PASSWORD api node apps/api/dist/src/bootstrap.js
unset ADMIN_EMAIL ADMIN_PASSWORD
```

## 4. Public host (`prachidham.com`, Plesk)

In Plesk for **prachidham.com**:

1. **SSL/TLS Certificates → Install a free Let's Encrypt certificate**, and enable
   the **301 HTTP→HTTPS** redirect.
2. **Apache & nginx Settings → uncheck "Proxy mode"**, then paste the following
   into **Additional nginx directives**:

   ```nginx
   # The staff console belongs on the application host.
   location ~ ^/staff(/|$) {
       return 301 https://platform.prachidham.com$request_uri;
   }

   # Everything else — including /api/* — is proxied so the public site keeps
   # calling its API same-origin. Do NOT redirect /api: a cross-origin redirect
   # would break the public pages' own fetches.
   location / {
       proxy_pass https://platform.prachidham.com;
       proxy_ssl_server_name on;
       proxy_set_header Host platform.prachidham.com;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header X-Forwarded-Host $host;
       proxy_read_timeout 60s;
       proxy_send_timeout 60s;
   }
   ```

   `proxy_ssl_server_name on` is required so Caddy receives the correct SNI for
   `platform.prachidham.com`. The browser's `Origin` header (`https://prachidham.com`)
   is preserved end-to-end and is accepted because it is in `PUBLIC_ALLOWED_ORIGINS`.

## 5. Verify

```sh
curl -I  https://prachidham.com/gu
curl -I  https://prachidham.com/hi/shop
curl -I  https://prachidham.com/en/contact
curl -fsS https://prachidham.com/api/v1/health
curl -fsS https://prachidham.com/robots.txt
curl -I  https://prachidham.com/staff          # expect 301 → platform.prachidham.com
curl -I  https://platform.prachidham.com/staff # expect 200
```

Expected:

- Public pages return `200` on `prachidham.com`; `/` redirects to `/gu`.
- `/api/v1/health` returns `{"status":"ok"}` through the proxy.
- `prachidham.com/staff` returns `301` to `platform.prachidham.com/staff`.
- Anonymous `/api/v1/me` and `/api/v1/admin/catalog` return **401**.
- The public inquiry endpoint returns **503** while
  `PUBLIC_COMMERCE_INQUIRIES_ENABLED=false`.
- Canonical and `hreflang` URLs in page source point at `https://prachidham.com`.
- During draft review `robots.txt` is disallow-all and `sitemap.xml` is empty —
  intentional.

Sign in at `https://platform.prachidham.com/staff`, then use `/staff/catalog` to
create drafts, review the three translations and publish approved offerings.

## 6. Updating

```sh
cd /opt/prachidham-platform
git pull
docker compose -f compose.yaml -f compose.split-domain.yaml up --build -d
```

`PUBLIC_SITE_INDEXABLE` and `PUBLIC_SITE_ORIGIN` are **web build arguments**, so
changing them requires a web rebuild, not just an `.env` edit. Back up and
test-restore PostgreSQL first. Never run `docker compose down -v` against a
database you intend to keep.

## 7. Troubleshooting

| Symptom | Check | Action |
|---|---|---|
| Caddy cannot obtain a certificate | `platform.prachidham.com` resolves to the VPS; 80/443 open | Fix DNS/firewall, then `logs --tail=100 proxy` |
| Public domain shows 502 | `curl https://platform.prachidham.com/` on the VPS | The stack is down or the upstream is wrong; check `ps` |
| `prachidham.com/staff` returns 200 instead of redirecting | Plesk nginx directives not applied | Re-check the `location ~ ^/staff` block and reload nginx |
| Public pages load but their catalog/API calls fail | `/api` is being redirected instead of proxied | Keep `/api/*` inside the proxied `location /` |
| Login returns 403 | Request `Origin` not in the allowlist | Confirm `PUBLIC_ALLOWED_ORIGINS` lists both origins, then restart `api` |
| Login returns 503 | Valkey unhealthy, or production with no `VALKEY_URL` | Check the `valkey` service; production rate limiting is fail-closed |
| Inquiry returns 503 | `PUBLIC_COMMERCE_INQUIRIES_ENABLED=false` | Expected until the privacy notice and retention workflow are approved |
| nginx: `duplicate location "/"` | Plesk proxy mode still on | Disable "Proxy mode", then reload |

## 8. Single-host alternative

If the public site and the application share **one** hostname, use
`compose.production.yaml` instead. Set `APP_HOST` to that hostname and leave
`PUBLIC_ALLOWED_ORIGINS` blank; both origins default to `https://APP_HOST`.

For a host where Plesk owns 80/443 and there is no Caddy, use
`compose.plesk.yaml` (see [self-hosting.md](self-hosting.md) for the general
runbook).
