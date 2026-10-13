# External references consulted

- [TimescaleDB HA image source](https://github.com/timescale/timescaledb-docker-ha): The official HA Docker image is published as `timescale/timescaledb-ha`; its [Dockerfile](https://raw.githubusercontent.com/timescale/timescaledb-docker-ha/master/Dockerfile) installs `postgresql-${pg}-pgvector`, preloads TimescaleDB, uses `/docker-entrypoint-initdb.d/`, and sets `PGDATA=/home/postgres/pgdata/data`. The `pg17` tag is a moving family tag; pin a tested digest for production.
- [pgvector source](https://github.com/pgvector/pgvector): enables via `CREATE EXTENSION vector`; extension supports PostgreSQL 13+ and stores typed vectors.
- [Tiger Data self-hosted install guide](https://www.tigerdata.com/docs/get-started/choose-your-path/install-timescaledb): native Ubuntu TimescaleDB requires package repository and `shared_preload_libraries=timescaledb`. It explicitly recommends backups, high availability, connection pooling and monitoring for production.
- [PostCSS advisory GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) and [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849): an initial dependency audit on 2026-09-30 found transitive PostCSS `<=8.5.17` in Next.js. A `pnpm-workspace.yaml` override now pins patched `8.5.28`; frozen install and production `pnpm audit --prod --audit-level high` returned no known vulnerabilities.

The supplied Prachi Dham logo at `apps/web/public/brand/logo.png` is the project's own asset. Image search found watermarked nonprofit stock imagery; it was not used.

## Public-homepage evidence (2026-09-30)

- The supplied logo says “PRACHI DHAM — GIR SOMNATH, GUJARAT.” A [public company directory entry](https://www.zaubacorp.com/PRACHI-DHAM-FOUNDATION-U85500GJ2026NPL171979) also lists the foundation's legal name and a registered address in Gujarat, but does **not** substantiate specific mission, project or impact claims.
- The [Gir Somnath district page on Prachi Tirth](https://girsomnath.nic.in/tourist-place/prachi-tirth/) describes the locality and pilgrimage site, **not** this foundation's activities. It was not used to invent foundation programs.
- A fetch of `https://prachidham.com/` returned no extractable public content. Do not assume domain ownership, contact details or approved public copy until confirmed by the foundation.
- Image search returned travel/stock photography without a confirmed reuse license or a demonstrable link to foundation work; the homepage uses only the supplied logo and CSS geometry, with no third-party photograph.
