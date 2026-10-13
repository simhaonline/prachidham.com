export const MODULE_KEYS = [
  'crm', 'erp', 'bpm', 'hrms', 'scm', 'bi', 'eam', 'plm', 'cms',
  'dms', 'ecm', 'its', 'psa', 'cdp', 'map', 'seo', 'geo',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export type ModuleDefinition = {
  key: ModuleKey;
  name: string;
  description: string;
  group: 'People' | 'Operations' | 'Knowledge' | 'Growth' | 'Intelligence';
};

export const MODULES: readonly ModuleDefinition[] = [
  { key: 'crm', name: 'Constituents', description: 'Donors, volunteers and beneficiaries', group: 'People' },
  { key: 'hrms', name: 'People & HR', description: 'Staff and volunteer operations', group: 'People' },
  { key: 'cdp', name: 'Constituent 360', description: 'Unified constituent profiles', group: 'People' },
  { key: 'erp', name: 'Grants & Finance', description: 'Grants and financial operations', group: 'Operations' },
  { key: 'bpm', name: 'Approvals', description: 'Requests and controlled decisions', group: 'Operations' },
  { key: 'scm', name: 'Procurement', description: 'Suppliers and purchase requests', group: 'Operations' },
  { key: 'eam', name: 'Assets', description: 'Facilities, equipment and maintenance', group: 'Operations' },
  { key: 'plm', name: 'Programs', description: 'Programs, outcomes and projects', group: 'Operations' },
  { key: 'its', name: 'IT Services', description: 'Service requests and incidents', group: 'Operations' },
  { key: 'psa', name: 'Services', description: 'Professional engagements and delivery', group: 'Operations' },
  { key: 'cms', name: 'Content', description: 'Editorial and publishing workspace', group: 'Knowledge' },
  { key: 'dms', name: 'Documents', description: 'Document metadata and ownership', group: 'Knowledge' },
  { key: 'ecm', name: 'Knowledge', description: 'Institutional content and retention', group: 'Knowledge' },
  { key: 'map', name: 'Campaigns', description: 'Consent-led campaign planning', group: 'Growth' },
  { key: 'seo', name: 'Search Visibility', description: 'Search pages and optimization work', group: 'Growth' },
  { key: 'bi', name: 'Analytics', description: 'Metrics and operational reporting', group: 'Intelligence' },
  { key: 'geo', name: 'Geospatial', description: 'Sites, service areas and distance', group: 'Intelligence' },
];

const moduleKeys = new Set<string>(MODULE_KEYS);
export const isModuleKey = (value: string): value is ModuleKey => moduleKeys.has(value);
export const getModule = (key: ModuleKey) => MODULES.find((module) => module.key === key)!;
