export type CatalogTranslation = { locale: string; slug: string; title: string; summary: string; reviewStatus: 'draft' | 'approved' };
export type CatalogAdminItem = {
  id: string;
  kind: 'product' | 'service';
  sku: string | null;
  amountPaise: number | null;
  currency: 'INR';
  publicationStatus: 'draft' | 'published';
  translations: CatalogTranslation[];
  createdAt: string;
};
export type CatalogFormValues = { kind: 'product' | 'service'; sku?: string | null; amountPaise?: number | null; currency: 'INR' };
export type TranslationFormValues = { locale: string; slug: string; title: string; summary: string };
export type AdminInquiry = { id: string; contactName: string; contactEmail: string; locale: string; status: 'pending_review' | 'contacted' | 'closed'; createdAt: string; itemCount: number };
export type Page<T> = { data: T[]; pagination: { limit: number; offset: number; total: number } };
