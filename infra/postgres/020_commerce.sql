-- Apply after 001_init.sql. Public listings exist only after three reviewed translations and an admin publication action.
CREATE TABLE IF NOT EXISTS catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  kind text NOT NULL CHECK (kind IN ('product', 'service')),
  sku text,
  amount_paise integer CHECK (amount_paise >= 0 AND amount_paise <= 1000000000),
  currency char(3) NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  publication_status text NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft','published')),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  UNIQUE (id, organization_id),
  CHECK ((kind = 'product' AND sku IS NOT NULL) OR (kind = 'service' AND sku IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS catalog_items_org_sku_idx ON catalog_items (organization_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS catalog_items_published_idx ON catalog_items (organization_id, kind, published_at DESC) WHERE publication_status = 'published';

CREATE TABLE IF NOT EXISTS catalog_translations (
  item_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  locale text NOT NULL CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) BETWEEN 3 AND 80),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 10 AND 1200),
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft','approved')),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, locale),
  FOREIGN KEY (item_id, organization_id) REFERENCES catalog_items(id, organization_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS catalog_translations_slug_idx ON catalog_translations (organization_id, locale, slug);
CREATE INDEX IF NOT EXISTS catalog_translations_public_idx ON catalog_translations (locale, review_status, item_id);

-- A request for availability is not an order, donation, booking, charge or tax receipt.
-- Keep the public POST disabled until a reviewed privacy policy/version and operations process exist.
CREATE TABLE IF NOT EXISTS commerce_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  contact_name text NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 120),
  contact_email text NOT NULL CHECK (char_length(contact_email) <= 254),
  locale text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','contacted','closed')),
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);
CREATE INDEX IF NOT EXISTS commerce_inquiries_org_recent_idx ON commerce_inquiries (organization_id, created_at DESC);
CREATE TABLE IF NOT EXISTS commerce_inquiry_items (
  inquiry_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity smallint NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  amount_paise_snapshot integer,
  title_snapshot text NOT NULL,
  PRIMARY KEY (inquiry_id, item_id),
  FOREIGN KEY (inquiry_id, organization_id) REFERENCES commerce_inquiries(id, organization_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id, organization_id) REFERENCES catalog_items(id, organization_id)
);
