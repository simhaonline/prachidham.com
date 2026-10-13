# Prachi Dham Foundation — capability map

The product is a private, organization-scoped nonprofit operations platform. Module IDs are stable API keys. **This repository implements a foundation, not completed enterprise suites.** All 17 domains have a discoverable registry and a common record workspace; domain-specific controls are added in phases.

| Module | Responsibility | Foundation deliverable | Later domain depth |
|---|---|---|---|
| CRM | Donors, volunteers, beneficiaries | Typed constituent records and search | Consent, dedupe, fundraising pipeline |
| ERP | Grants and finance | Grant records; general record workspace | Double-entry accounting, reconciliation, restricted funds |
| BPM | Approvals and workflows | Request lifecycle with authorization and audit | Visual workflow builder, SLA/escalation |
| HRMS | People operations | Staff record workspace | Payroll, leave, personnel files |
| SCM | Procurement | Purchase request workspace | Vendor lifecycle, three-way matching |
| BI | Analytics | Live counts and recent activity | Governed metrics, scheduled reports |
| EAM | Assets | Asset record workspace | Depreciation and maintenance plans |
| PLM | Programs and projects | Program record workspace | Outcomes and milestone dependencies |
| CMS | Content | Content workspace | Publishing pipeline and public site |
| DMS | Documents | Document metadata workspace | Encrypted object storage and versioning |
| ECM | Enterprise content | Knowledge record workspace | Retention and legal holds |
| ITS | IT services | Ticket workspace | Service catalog and SLA automation |
| PSA | Professional services | Engagement workspace | Timesheets and service billing |
| CDP | Constituent profiles | Profile workspace | Identity resolution and activation |
| MAP | Marketing automation | Campaign workspace | Consent-led journeys and messaging |
| SEO | Search visibility | Search-page workspace | Search-console integration and audits |
| GEO | Geospatial intelligence | Site records and distance service | PostGIS, map layers and spatial joins |

## Dependency direction

`identity & organization → audit & record platform → CRM/ERP/BPM/PLM workspaces → dashboard → specialist intelligence/geo services → deeper domain implementations`. Shared data contracts use the versioned Nest API; services do not read each other's databases directly. The present release supplies real persisted CRUD only when a database is configured. The static public homepage at `/` is a review draft, **not** CMS-driven publishing. The release does not claim payroll, accounting, fundraising payments, document storage, consent compliance or third-party connectors.

## Deployment boundary

This code is a portable Docker Compose reference with Next.js, NestJS, Python, Go, PostgreSQL/TimescaleDB/pgvector and Valkey. A separate self-hosted overlay specifies Caddy TLS ingress but has not run on the user's server. Production still needs approved secrets handling, backups, monitoring, data-retention policy, threat model, and a chosen jurisdiction before importing real beneficiaries or financial information. The sandbox has no Docker daemon, so Compose boot cannot be attested here.
