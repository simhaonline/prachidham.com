import { Injectable } from '@nestjs/common';
import { MODULE_KEYS, type ModuleKey } from './catalog';
import { Database } from './database';
import { canAccessModule } from './policy';
import type { RequestUser } from './types';

@Injectable()
export class DashboardService {
  constructor(private readonly db: Database) {}

  async overview(user: RequestUser) {
    const visible = MODULE_KEYS.filter((key) => canAccessModule(user.role, key));
    const [counts, recent] = await Promise.all([
      this.db.query<{ module_key: ModuleKey; count: string }>(`
        SELECT module_key, count(*)::text AS count FROM records
        WHERE organization_id = $1 AND module_key = ANY($2::text[])
        GROUP BY module_key
      `, [user.organizationId, visible]),
      this.db.query<{ id: string; module_key: string; title: string; status: string; updated_at: Date }>(`
        SELECT id, module_key, title, status, updated_at FROM records
        WHERE organization_id = $1 AND module_key = ANY($2::text[])
        ORDER BY updated_at DESC LIMIT 6
      `, [user.organizationId, visible]),
    ]);
    const byKey = new Map(counts.rows.map((row) => [row.module_key, Number(row.count)]));
    const modules = visible.map((key) => ({ key, count: byKey.get(key) ?? 0 }));
    return {
      totalRecords: modules.reduce((sum, item) => sum + item.count, 0),
      modules,
      recent: recent.rows.map((row) => ({ id: row.id, moduleKey: row.module_key, title: row.title, status: row.status, updatedAt: row.updated_at })),
    };
  }
}
