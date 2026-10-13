import { describe, expect, it } from 'vitest';
import { MODULES, isModuleKey } from '../src/catalog';
import { parseRecordInput, parsePagination } from '../src/validation';

describe('module registry', () => {
  it('contains every requested platform domain exactly once', () => {
    expect([...MODULES.map((entry) => entry.key)].sort()).toEqual([
      'crm', 'erp', 'bpm', 'hrms', 'scm', 'bi', 'eam', 'plm', 'cms',
      'dms', 'ecm', 'its', 'psa', 'cdp', 'map', 'seo', 'geo',
    ].sort());
    expect(isModuleKey('crm')).toBe(true);
    expect(isModuleKey('payments')).toBe(false);
  });
});

describe('input validation', () => {
  it('normalizes valid record input and rejects empty or oversized fields', () => {
    expect(parseRecordInput({ title: '  Water programme  ', data: { district: 'Gir Somnath' } })).toEqual({
      title: 'Water programme', data: { district: 'Gir Somnath' }, status: 'active',
    });
    expect(() => parseRecordInput({ title: '   ' })).toThrow();
    expect(() => parseRecordInput({ title: 'x'.repeat(161) })).toThrow();
    expect(() => parseRecordInput({ title: 'Large payload', data: { notes: 'x'.repeat(9000) } })).toThrow();
  });

  it('bounds collection pages', () => {
    expect(parsePagination({ limit: '25', offset: '10' })).toEqual({ limit: 25, offset: 10 });
    expect(parsePagination({ limit: '1000', offset: '-2' })).toEqual({ limit: 100, offset: 0 });
  });
});
