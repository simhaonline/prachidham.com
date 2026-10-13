import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Database } from './database';
import { writeAudit } from './audit';
import type { RequestUser } from './types';
import type { CatalogItemInput, CatalogTranslationInput } from './commerce.validation';

const PUBLIC_ORGANIZATION_SLUG = process.env.PUBLIC_ORGANIZATION_SLUG || 'prachi-dham';
const REQUIRED_LOCALES = (process.env.PUBLIC_REQUIRED_LOCALES || 'gu,hi,en').split(',').map((code) => code.trim());
if (!REQUIRED_LOCALES.length || new Set(REQUIRED_LOCALES).size !== REQUIRED_LOCALES.length ||
    REQUIRED_LOCALES.some((code) => !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(code))) {
  throw new Error('PUBLIC_REQUIRED_LOCALES must be unique language codes.');
}

function requirePublisher(user: RequestUser) {
  if (!['owner', 'admin'].includes(user.role)) throw new ForbiddenException('Catalog publication requires an administrator.');
}

@Injectable()
export class CatalogService {
  constructor(private readonly db: Database) {}

  async listPublic(locale: string, kind?: 'product' | 'service', limit = 20, offset = 0) {
    // Locale-specific rows must be reviewed; no unreviewed machine/fallback copy is public.
    const sql = `FROM catalog_items i
      JOIN organizations o ON o.id = i.organization_id
      JOIN catalog_translations t ON t.item_id = i.id AND t.organization_id = i.organization_id
      WHERE o.slug = $1 AND i.publication_status = 'published'
        AND t.locale = $2 AND t.review_status = 'approved'
        AND ($3::text IS NULL OR i.kind = $3)`;
    const args = [PUBLIC_ORGANIZATION_SLUG, locale, kind ?? null];
    const [items, count] = await Promise.all([
      this.db.query(`SELECT i.id, i.kind, i.sku, i.amount_paise AS "amountPaise", i.currency,
          t.slug, t.title, t.summary, t.locale
        ${sql} ORDER BY i.published_at DESC, i.id DESC LIMIT $4 OFFSET $5`, [...args, limit, offset]),
      this.db.query<{ total: string }>(`SELECT count(*)::text AS total ${sql}`, args),
    ]);
    return { data: items.rows, pagination: { limit, offset, total: Number(count.rows[0]?.total ?? 0) } };
  }

  async getPublic(locale: string, slug: string) {
    const result = await this.db.query(`SELECT i.id, i.kind, i.sku, i.amount_paise AS "amountPaise", i.currency,
        t.slug, t.title, t.summary, t.locale,
        (SELECT jsonb_object_agg(s.locale, s.slug) FROM catalog_translations s
          WHERE s.item_id = i.id AND s.organization_id = i.organization_id
            AND s.review_status = 'approved') AS "alternateSlugs"
      FROM catalog_translations t JOIN catalog_items i ON i.id = t.item_id AND i.organization_id = t.organization_id
      JOIN organizations o ON o.id = i.organization_id
      WHERE o.slug = $1 AND t.locale = $2 AND t.slug = $3
        AND i.publication_status = 'published' AND t.review_status = 'approved'`, [PUBLIC_ORGANIZATION_SLUG, locale, slug]);
    if (!result.rows[0]) throw new NotFoundException('Listing not found.');
    return result.rows[0];
  }

  async listAdmin(user: RequestUser, limit = 20, offset = 0) {
    requirePublisher(user);
    const [items, count] = await Promise.all([
      this.db.query(`SELECT i.id, i.kind, i.sku, i.amount_paise AS "amountPaise", i.currency,
          i.publication_status AS "publicationStatus", i.created_at AS "createdAt",
          COALESCE(jsonb_agg(jsonb_build_object('locale', t.locale, 'slug', t.slug,
            'title', t.title, 'summary', t.summary, 'reviewStatus', t.review_status))
            FILTER (WHERE t.locale IS NOT NULL), '[]'::jsonb) AS translations
        FROM catalog_items i LEFT JOIN catalog_translations t ON t.item_id = i.id AND t.organization_id = i.organization_id
        WHERE i.organization_id = $1
        GROUP BY i.id ORDER BY i.created_at DESC, i.id DESC LIMIT $2 OFFSET $3`, [user.organizationId, limit, offset]),
      this.db.query<{ total: string }>('SELECT count(*)::text AS total FROM catalog_items WHERE organization_id = $1', [user.organizationId]),
    ]);
    return { data: items.rows, pagination: { limit, offset, total: Number(count.rows[0]?.total ?? 0) } };
  }

  async create(user: RequestUser, input: CatalogItemInput) {
    requirePublisher(user);
    return this.db.transaction(async (client) => {
      const created = await client.query(`INSERT INTO catalog_items
        (organization_id, kind, sku, amount_paise, currency, created_by)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, kind, sku, amount_paise AS "amountPaise", currency, publication_status AS "publicationStatus"`,
      [user.organizationId, input.kind, input.sku ?? null, input.amountPaise ?? null, input.currency, user.id]);
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: 'catalog.created', resourceType: 'catalog_item', resourceId: created.rows[0].id });
      return created.rows[0];
    });
  }

  async update(user: RequestUser, id: string, input: CatalogItemInput) {
    requirePublisher(user);
    return this.db.transaction(async (client) => {
      const changed = await client.query(`UPDATE catalog_items
        SET kind = $3, sku = $4, amount_paise = $5, currency = $6,
          publication_status = 'draft', published_at = NULL, updated_at = now()
        WHERE id = $1 AND organization_id = $2
        RETURNING id, kind, sku, amount_paise AS "amountPaise", currency, publication_status AS "publicationStatus"`,
      [id, user.organizationId, input.kind, input.sku ?? null, input.amountPaise ?? null, input.currency]);
      if (!changed.rows[0]) throw new NotFoundException('Catalog item not found.');
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: 'catalog.updated', resourceType: 'catalog_item', resourceId: id });
      return changed.rows[0];
    });
  }

  async upsertTranslation(user: RequestUser, id: string, input: CatalogTranslationInput) {
    requirePublisher(user);
    return this.db.transaction(async (client) => {
      const item = await client.query('SELECT id FROM catalog_items WHERE id = $1 AND organization_id = $2 FOR UPDATE', [id, user.organizationId]);
      if (!item.rows[0]) throw new NotFoundException('Catalog item not found.');
      const translated = await client.query(`INSERT INTO catalog_translations
        (item_id, organization_id, locale, slug, title, summary)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (item_id, locale) DO UPDATE SET slug = EXCLUDED.slug,
          title = EXCLUDED.title, summary = EXCLUDED.summary,
          review_status = 'draft', reviewed_by = NULL, reviewed_at = NULL, updated_at = now()
        RETURNING locale, slug, title, summary, review_status AS "reviewStatus"`,
      [id, user.organizationId, input.locale, input.slug, input.title, input.summary]);
      await client.query("UPDATE catalog_items SET publication_status = 'draft', published_at = NULL, updated_at = now() WHERE id = $1 AND organization_id = $2", [id, user.organizationId]);
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: 'catalog.translation_drafted', resourceType: 'catalog_item', resourceId: id, changes: { locale: input.locale } });
      return translated.rows[0];
    });
  }

  async approveTranslation(user: RequestUser, id: string, locale: string) {
    requirePublisher(user);
    return this.db.transaction(async (client) => {
      const approved = await client.query(`UPDATE catalog_translations SET review_status = 'approved',
        reviewed_by = $4, reviewed_at = now(), updated_at = now()
        WHERE item_id = $1 AND organization_id = $2 AND locale = $3
        RETURNING locale, review_status AS "reviewStatus"`, [id, user.organizationId, locale, user.id]);
      if (!approved.rows[0]) throw new NotFoundException('Translation not found.');
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: 'catalog.translation_approved', resourceType: 'catalog_item', resourceId: id, changes: { locale } });
      return approved.rows[0];
    });
  }

  async setPublished(user: RequestUser, id: string, publish: boolean) {
    requirePublisher(user);
    return this.db.transaction(async (client) => {
      const item = await client.query(`SELECT kind, amount_paise, publication_status FROM catalog_items
        WHERE id = $1 AND organization_id = $2 FOR UPDATE`, [id, user.organizationId]);
      if (!item.rows[0]) throw new NotFoundException('Catalog item not found.');
      if (publish) {
        const reviewed = await client.query(`SELECT locale FROM catalog_translations
          WHERE item_id = $1 AND organization_id = $2 AND review_status = 'approved'
            AND locale = ANY($3::text[])`, [id, user.organizationId, REQUIRED_LOCALES]);
        if (reviewed.rows.length !== REQUIRED_LOCALES.length ||
            !REQUIRED_LOCALES.every((locale) => reviewed.rows.some((row) => row.locale === locale))) {
          throw new BadRequestException(`Publish requires approved translations: ${REQUIRED_LOCALES.join(', ')}.`);
        }
        if (item.rows[0].kind === 'product' && item.rows[0].amount_paise === null) {
          throw new BadRequestException('A published product requires an approved INR amount.');
        }
      }
      const result = await client.query(`UPDATE catalog_items SET publication_status = $3,
        published_at = CASE WHEN $4::boolean THEN now() ELSE NULL END, updated_at = now()
        WHERE id = $1 AND organization_id = $2 RETURNING id, publication_status`,
      [id, user.organizationId, publish ? 'published' : 'draft', publish]);
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: publish ? 'catalog.published' : 'catalog.unpublished', resourceType: 'catalog_item', resourceId: id });
      return result.rows[0];
    });
  }
}
