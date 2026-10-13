CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','manager','staff','viewer')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_organization_idx ON users (organization_id);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  module_key text NOT NULL CHECK (module_key IN (
    'crm','erp','bpm','hrms','scm','bi','eam','plm','cms','dms','ecm','its','psa','cdp','map','seo','geo'
  )),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  status text NOT NULL DEFAULT 'active',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS records_org_module_recent_idx ON records (organization_id, module_key, updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS records_data_idx ON records USING gin (data);

CREATE TABLE IF NOT EXISTS audit_events (
  occurred_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (occurred_at, id)
);
SELECT create_hypertable('audit_events', by_range('occurred_at'), if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS audit_org_recent_idx ON audit_events (organization_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events are append-only';
END;
$$;
DROP TRIGGER IF EXISTS audit_events_append_only ON audit_events;
CREATE TRIGGER audit_events_append_only
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();
