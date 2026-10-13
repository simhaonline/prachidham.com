import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { hashSessionToken } from './auth-crypto';
import { Database } from './database';
import { RateLimitService } from './rate-limit.service';
import type { InquiryInput } from './commerce-inquiry.validation';
import type { RequestUser } from './types';
import { writeAudit } from './audit';

const PUBLIC_ORGANIZATION_SLUG = process.env.PUBLIC_ORGANIZATION_SLUG || 'prachi-dham';

@Injectable()
export class CommerceInquiryService {
  constructor(private readonly db: Database, private readonly limiter: RateLimitService) {}

  configuration() {
    const version = process.env.COMMERCE_POLICY_VERSION || '';
    const policyUrl = process.env.PUBLIC_PRIVACY_POLICY_URL || '';
    let validPolicy = false;
    try { validPolicy = new URL(policyUrl).protocol === 'https:'; } catch { /* missing policy stays disabled */ }
    const enabled = process.env.PUBLIC_COMMERCE_INQUIRIES_ENABLED === 'true' &&
      /^[A-Za-z0-9._-]{3,40}$/.test(version) && validPolicy;
    return { inquiriesEnabled: enabled, policyUrl: enabled ? policyUrl : null, policyVersion: enabled ? version : null };
  }

  async create(input: InquiryInput) {
    const config = this.configuration();
    if (!config.inquiriesEnabled || !config.policyVersion) {
      throw new ServiceUnavailableException('Public inquiries are not yet enabled.');
    }
    const [accountAllowed, globalAllowed] = await Promise.all([
      this.limiter.check(`commerce:email:${hashSessionToken(input.email)}`, 5, 3600),
      this.limiter.check('commerce:global', 120, 60),
    ]);
    if (!accountAllowed || !globalAllowed) throw new HttpException('Too many requests. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
    const org = await this.db.query<{ id: string }>('SELECT id FROM organizations WHERE slug = $1', [PUBLIC_ORGANIZATION_SLUG]);
    if (!org.rows[0]) throw new ServiceUnavailableException('Catalog organization is not configured.');
    const organizationId = org.rows[0].id;
    return this.db.transaction(async (client) => {
      const reviewed: Array<{ id: string; title: string; amount: number | null; quantity: number }> = [];
      for (const item of input.items) {
        const listing = await client.query<{ id: string; title: string; amount_paise: number | null }>(`
          SELECT i.id, i.amount_paise, t.title FROM catalog_items i
          JOIN catalog_translations t ON t.item_id = i.id AND t.organization_id = i.organization_id
          WHERE i.id = $1 AND i.organization_id = $2 AND i.publication_status = 'published'
            AND t.locale = $3 AND t.review_status = 'approved' FOR SHARE OF i, t`,
        [item.id, organizationId, input.locale]);
        if (!listing.rows[0]) throw new BadRequestException('One or more selections are no longer available.');
        reviewed.push({ id: listing.rows[0].id, title: listing.rows[0].title, amount: listing.rows[0].amount_paise, quantity: item.quantity });
      }
      const inquiry = await client.query<{ id: string; status: string }>(`
        INSERT INTO commerce_inquiries (organization_id, contact_name, contact_email, locale, policy_version)
        VALUES ($1, $2, $3, $4, $5) RETURNING id, status`,
      [organizationId, input.name, input.email, input.locale, config.policyVersion]);
      for (const item of reviewed) {
        await client.query(`INSERT INTO commerce_inquiry_items
          (inquiry_id, organization_id, item_id, quantity, amount_paise_snapshot, title_snapshot)
          VALUES ($1, $2, $3, $4, $5, $6)`,
        [inquiry.rows[0].id, organizationId, item.id, item.quantity, item.amount, item.title]);
      }
      await client.query(`INSERT INTO audit_events (organization_id, actor_id, action, resource_type, resource_id, changes)
        VALUES ($1, NULL, 'commerce.inquiry_received', 'commerce_inquiry', $2, $3::jsonb)`,
      [organizationId, inquiry.rows[0].id, JSON.stringify({ itemCount: reviewed.length })]);
      return { id: inquiry.rows[0].id, status: inquiry.rows[0].status, message: 'Inquiry received for staff review; no payment has been taken.' };
    });
  }

  async listAdmin(user: RequestUser, limit = 20, offset = 0) {
    if (!['owner', 'admin'].includes(user.role)) throw new ForbiddenException('Inquiry management requires an administrator.');
    const [items, count] = await Promise.all([
      this.db.query(`SELECT q.id, q.contact_name AS "contactName", q.contact_email AS "contactEmail",
        q.locale, q.status, q.created_at AS "createdAt", COUNT(qi.item_id)::int AS "itemCount"
        FROM commerce_inquiries q LEFT JOIN commerce_inquiry_items qi ON qi.inquiry_id = q.id
        WHERE q.organization_id = $1 GROUP BY q.id ORDER BY q.created_at DESC LIMIT $2 OFFSET $3`,
      [user.organizationId, limit, offset]),
      this.db.query<{ total: string }>('SELECT count(*)::text AS total FROM commerce_inquiries WHERE organization_id = $1', [user.organizationId]),
    ]);
    return { data: items.rows, pagination: { limit, offset, total: Number(count.rows[0]?.total ?? 0) } };
  }

  async updateStatus(user: RequestUser, id: string, status: 'contacted' | 'closed') {
    if (!['owner', 'admin'].includes(user.role)) throw new ForbiddenException();
    return this.db.transaction(async (client) => {
      const updated = await client.query(`UPDATE commerce_inquiries SET status = $3
        WHERE id = $1 AND organization_id = $2 RETURNING id, status`, [id, user.organizationId, status]);
      if (!updated.rows[0]) throw new NotFoundException('Inquiry not found.');
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: `commerce.inquiry_${status}`, resourceType: 'commerce_inquiry', resourceId: id });
      return updated.rows[0];
    });
  }

  async getAdmin(user: RequestUser, id: string) {
    if (!['owner', 'admin'].includes(user.role)) throw new ForbiddenException();
    const result = await this.db.query(`SELECT q.id, q.contact_name AS "contactName", q.contact_email AS "contactEmail",
      q.locale, q.status, q.created_at AS "createdAt", q.policy_version AS "policyVersion",
      COALESCE(jsonb_agg(jsonb_build_object('itemId', qi.item_id, 'title', qi.title_snapshot,
        'quantity', qi.quantity, 'amountPaiseSnapshot', qi.amount_paise_snapshot)) FILTER (WHERE qi.item_id IS NOT NULL), '[]'::jsonb) AS items
      FROM commerce_inquiries q LEFT JOIN commerce_inquiry_items qi ON qi.inquiry_id = q.id
      WHERE q.id = $1 AND q.organization_id = $2 GROUP BY q.id`, [id, user.organizationId]);
    if (!result.rows[0]) throw new NotFoundException('Inquiry not found.');
    return result.rows[0];
  }
}
