import { describe, expect, it } from 'vitest';
import { canAccessModule, canMutateModule, canTransition } from '../src/policy';

describe('role policy', () => {
  it('keeps sensitive constituent modules hidden from viewers', () => {
    expect(canAccessModule('viewer', 'crm')).toBe(false);
    expect(canAccessModule('viewer', 'hrms')).toBe(false);
    expect(canAccessModule('viewer', 'cdp')).toBe(false);
    expect(canAccessModule('viewer', 'bi')).toBe(true);
  });

  it('prevents viewers from mutating and requires managers for finance', () => {
    expect(canMutateModule('viewer', 'plm')).toBe(false);
    expect(canMutateModule('staff', 'plm')).toBe(true);
    expect(canMutateModule('staff', 'erp')).toBe(false);
    expect(canMutateModule('manager', 'erp')).toBe(true);
  });

  it('permits only valid workflow transitions for each role', () => {
    expect(canTransition('staff', 'draft', 'submitted')).toBe(true);
    expect(canTransition('staff', 'submitted', 'approved')).toBe(false);
    expect(canTransition('manager', 'submitted', 'approved')).toBe(true);
    expect(canTransition('manager', 'approved', 'draft')).toBe(false);
  });
});
