import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Database } from './database';
import { writeAudit } from './audit';
import { canAccessModule, canMutateModule, canTransition } from './policy';
import type { ModuleKey } from './catalog';
import type { RequestUser, RecordRow } from './types';
import type { RecordInput } from './validation';

const mapRecord = (row: RecordRow) => ({
  id: row.id, moduleKey: row.module_key, title: row.title, status: row.status,
  data: row.data, createdAt: row.created_at, updatedAt: row.updated_at,
});

@Injectable()
export class RecordsService {
  constructor(private readonly db: Database) {}

  async list(user: RequestUser, moduleKey: ModuleKey, pagination: { limit: number; offset: number }, search: string) {
    if (!canAccessModule(user.role, moduleKey)) throw new ForbiddenException('This workspace is not available to your role.');
    const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    const args = [user.organizationId, moduleKey, pattern];
    const where = `organization_id = $1 AND module_key = $2 AND title ILIKE $3 ESCAPE '\\'`;
    const [rows, count] = await Promise.all([
      this.db.query<RecordRow>(`SELECT id, module_key, title, status, data, created_at, updated_at FROM records WHERE ${where} ORDER BY updated_at DESC, id DESC LIMIT $4 OFFSET $5`, [...args, pagination.limit, pagination.offset]),
      this.db.query<{ total: string }>(`SELECT count(*)::text AS total FROM records WHERE ${where}`, args),
    ]);
    return { data: rows.rows.map(mapRecord), pagination: { ...pagination, total: Number(count.rows[0]?.total ?? 0) } };
  }

  async get(user: RequestUser, moduleKey: ModuleKey, id: string) {
    if (!canAccessModule(user.role, moduleKey)) throw new ForbiddenException('This workspace is not available to your role.');
    const result = await this.db.query<RecordRow>(`SELECT id, module_key, title, status, data, created_at, updated_at FROM records WHERE id = $1 AND organization_id = $2 AND module_key = $3`, [id, user.organizationId, moduleKey]);
    if (!result.rows[0]) throw new NotFoundException('Record not found.');
    return mapRecord(result.rows[0]);
  }

  async create(user: RequestUser, moduleKey: ModuleKey, input: RecordInput) {
    if (!canMutateModule(user.role, moduleKey)) throw new ForbiddenException('You cannot create records here.');
    if (moduleKey === 'bpm' && !['active', 'draft'].includes(input.status)) throw new UnprocessableEntityException('Create a draft request before transitioning it.');
    return this.db.transaction(async (client) => {
      const status = moduleKey === 'bpm' ? 'draft' : input.status;
      const result = await client.query<RecordRow>(`
        INSERT INTO records (organization_id, module_key, title, status, data, created_by)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        RETURNING id, module_key, title, status, data, created_at, updated_at
      `, [user.organizationId, moduleKey, input.title, status, JSON.stringify(input.data), user.id]);
      const row = result.rows[0];
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: 'record.created', resourceType: moduleKey, resourceId: row.id });
      return mapRecord(row);
    });
  }

  async update(user: RequestUser, moduleKey: ModuleKey, id: string, input: RecordInput) {
    if (!canMutateModule(user.role, moduleKey)) throw new ForbiddenException('You cannot update records here.');
    if (moduleKey === 'bpm' && !['active', 'draft'].includes(input.status)) throw new UnprocessableEntityException('Use the transition endpoint to change an approval status.');
    return this.db.transaction(async (client) => {
      const current = await client.query<RecordRow>('SELECT id, status FROM records WHERE id = $1 AND organization_id = $2 AND module_key = $3 FOR UPDATE', [id, user.organizationId, moduleKey]);
      if (!current.rows[0]) throw new NotFoundException('Record not found.');
      if (moduleKey === 'bpm' && current.rows[0].status !== 'draft') throw new UnprocessableEntityException('Only draft requests can be edited.');
      const status = moduleKey === 'bpm' ? 'draft' : input.status;
      const result = await client.query<RecordRow>(`
        UPDATE records SET title = $1, data = $2::jsonb, status = $3, updated_at = now()
        WHERE id = $4 AND organization_id = $5 AND module_key = $6
        RETURNING id, module_key, title, status, data, created_at, updated_at
      `, [input.title, JSON.stringify(input.data), status, id, user.organizationId, moduleKey]);
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: 'record.updated', resourceType: moduleKey, resourceId: id, changes: { fields: ['title', 'data', 'status'] } });
      return mapRecord(result.rows[0]);
    });
  }

  async transition(user: RequestUser, id: string, to: 'submitted' | 'approved' | 'rejected') {
    return this.db.transaction(async (client) => {
      const result = await client.query<RecordRow>(`SELECT id, module_key, title, status, data, created_at, updated_at FROM records WHERE id = $1 AND organization_id = $2 AND module_key = 'bpm' FOR UPDATE`, [id, user.organizationId]);
      const record = result.rows[0];
      if (!record) throw new NotFoundException('Record not found.');
      if (!canTransition(user.role, record.status, to)) throw new ForbiddenException('The transition is not allowed for your role or the current status.');
      const updated = await client.query<RecordRow>(`UPDATE records SET status = $1, updated_at = now() WHERE id = $2 AND organization_id = $3 RETURNING id, module_key, title, status, data, created_at, updated_at`, [to, id, user.organizationId]);
      await writeAudit(client, { organizationId: user.organizationId, actorId: user.id, action: 'workflow.transitioned', resourceType: 'bpm', resourceId: id, changes: { from: record.status, to } });
      return mapRecord(updated.rows[0]);
    });
  }
}
