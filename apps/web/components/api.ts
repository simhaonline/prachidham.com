import type { CurrentUser, DashboardData, ModuleDefinition, RecordData, RecordPage, WorkspaceRecord } from './types';
import type { AdminInquiry, CatalogAdminItem, CatalogFormValues, CatalogTranslation, Page, TranslationFormValues } from './commerce-types';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function messageFromBody(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const details = body as Record<string, unknown>;
    if (typeof details.detail === 'string') return details.detail;
    if (typeof details.message === 'string') return details.message;
    if (typeof details.title === 'string') return details.title;
  }

  return `Request failed (${status}).`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  const raw = await response.text();
  let body: unknown = null;

  if (raw) {
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      body = raw;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, messageFromBody(body, response.status));
  }

  return body as T;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await request<{ user: CurrentUser }>('/api/v1/me');
  return response.user;
}

export async function login(email: string, password: string): Promise<void> {
  await request<unknown>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  await request<unknown>('/api/v1/auth/logout', { method: 'POST' });
}

export async function getModules(): Promise<ModuleDefinition[]> {
  const response = await request<{ modules: ModuleDefinition[] }>('/api/v1/modules');
  return response.modules;
}

export function getDashboard(): Promise<DashboardData> {
  return request<DashboardData>('/api/v1/dashboard');
}

export function getRecords(moduleKey: string, options: { limit: number; offset: number; search: string }): Promise<RecordPage> {
  const query = new URLSearchParams({
    limit: String(options.limit),
    offset: String(options.offset),
  });

  if (options.search.trim()) query.set('search', options.search.trim());

  return request<RecordPage>(`/api/v1/modules/${encodeURIComponent(moduleKey)}/records?${query.toString()}`);
}

export function createRecord(moduleKey: string, values: { title: string; status?: string; data?: RecordData }): Promise<WorkspaceRecord> {
  return request<WorkspaceRecord>(`/api/v1/modules/${encodeURIComponent(moduleKey)}/records`, {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

export function updateRecord(moduleKey: string, recordId: string, values: { title: string; status?: string; data?: RecordData }): Promise<WorkspaceRecord> {
  return request<WorkspaceRecord>(`/api/v1/modules/${encodeURIComponent(moduleKey)}/records/${encodeURIComponent(recordId)}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

export function transitionBpmRecord(recordId: string, status: 'submitted' | 'approved' | 'rejected'): Promise<WorkspaceRecord> {
  return request<WorkspaceRecord>(`/api/v1/modules/bpm/records/${encodeURIComponent(recordId)}/transition`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export function summarizeNote(title: string, text: string): Promise<{ summary: string }> {
  return request<{ summary: string }>('/api/v1/intelligence/summary', {
    method: 'POST',
    body: JSON.stringify({ title, text }),
  });
}

export function getDistance(coordinates: { lat1: number; lon1: number; lat2: number; lon2: number }): Promise<{ kilometers: number }> {
  const params = new URLSearchParams(Object.entries(coordinates).map(([key, value]) => [key, String(value)]));
  return request<{ kilometers: number }>(`/api/v1/geo/distance?${params.toString()}`);
}

export function getAdminCatalog(): Promise<Page<CatalogAdminItem>> {
  return request<Page<CatalogAdminItem>>('/api/v1/admin/catalog?limit=50&offset=0');
}

export function createCatalogItem(values: CatalogFormValues): Promise<CatalogAdminItem> {
  return request<CatalogAdminItem>('/api/v1/admin/catalog', { method: 'POST', body: JSON.stringify(values) });
}

export function updateCatalogItem(id: string, values: CatalogFormValues): Promise<CatalogAdminItem> {
  return request<CatalogAdminItem>(`/api/v1/admin/catalog/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(values) });
}

export function saveCatalogTranslation(id: string, values: TranslationFormValues): Promise<CatalogTranslation> {
  return request<CatalogTranslation>(`/api/v1/admin/catalog/${encodeURIComponent(id)}/translations`, { method: 'POST', body: JSON.stringify(values) });
}

export function approveCatalogTranslation(id: string, locale: string): Promise<CatalogTranslation> {
  return request<CatalogTranslation>(`/api/v1/admin/catalog/${encodeURIComponent(id)}/translations/${encodeURIComponent(locale)}/approval`, { method: 'POST' });
}

export function setCatalogPublished(id: string, published: boolean): Promise<CatalogAdminItem> {
  return request<CatalogAdminItem>(`/api/v1/admin/catalog/${encodeURIComponent(id)}/publication`, { method: 'POST', body: JSON.stringify({ published }) });
}

export function getAdminInquiries(): Promise<Page<AdminInquiry>> {
  return request<Page<AdminInquiry>>('/api/v1/admin/inquiries?limit=50&offset=0');
}

export function updateInquiryStatus(id: string, status: 'contacted' | 'closed'): Promise<AdminInquiry> {
  return request<AdminInquiry>(`/api/v1/admin/inquiries/${encodeURIComponent(id)}/status`, { method: 'POST', body: JSON.stringify({ status }) });
}
