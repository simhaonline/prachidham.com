import type { ModuleKey } from './catalog';

export const ROLES = ['owner', 'admin', 'manager', 'staff', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

const sensitiveModules = new Set<ModuleKey>(['crm', 'hrms', 'cdp']);
const controlledModules = new Set<ModuleKey>(['erp', 'hrms']);

export function canAccessModule(role: Role, module: string): boolean {
  if (role === 'viewer' && sensitiveModules.has(module as ModuleKey)) return false;
  return true;
}

export function canMutateModule(role: Role, module: string): boolean {
  if (role === 'viewer') return false;
  if (controlledModules.has(module as ModuleKey)) return ['owner', 'admin', 'manager'].includes(role);
  return true;
}

export function canTransition(role: Role, from: string, to: string): boolean {
  if (from === 'draft' && to === 'submitted') return role !== 'viewer';
  if (from === 'submitted' && (to === 'approved' || to === 'rejected')) {
    return ['owner', 'admin', 'manager'].includes(role);
  }
  return false;
}
