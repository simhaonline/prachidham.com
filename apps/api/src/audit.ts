import type { PoolClient } from 'pg';

export async function writeAudit(client: PoolClient, event: {
  organizationId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
}): Promise<void> {
  await client.query(`
    INSERT INTO audit_events (organization_id, actor_id, action, resource_type, resource_id, changes)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
  `, [event.organizationId, event.actorId, event.action, event.resourceType, event.resourceId ?? null, JSON.stringify(event.changes ?? {})]);
}
