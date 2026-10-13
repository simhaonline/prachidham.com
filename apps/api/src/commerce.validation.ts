import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const itemSchema = z.object({
  kind: z.enum(['product', 'service']),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{2,39}$/).nullable().optional(),
  amountPaise: z.number().int().min(0).max(1_000_000_000).nullable().optional(),
  currency: z.literal('INR').default('INR'),
}).strict().superRefine((value, ctx) => {
  if (value.kind === 'product' && !value.sku) ctx.addIssue({ code: 'custom', path: ['sku'], message: 'A product SKU is required.' });
  if (value.kind === 'service' && value.sku) ctx.addIssue({ code: 'custom', path: ['sku'], message: 'Services do not use product SKUs.' });
});

const translationSchema = z.object({
  locale: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(80),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(1200),
}).strict();

export type CatalogItemInput = z.infer<typeof itemSchema>;
export type CatalogTranslationInput = z.infer<typeof translationSchema>;

export function parseCatalogItem(value: unknown): CatalogItemInput {
  const result = itemSchema.safeParse(value);
  if (!result.success) throw new BadRequestException('Invalid catalog item: kind, SKU and INR amount must be valid.');
  return result.data;
}

export function parseCatalogTranslation(value: unknown): CatalogTranslationInput {
  const result = translationSchema.safeParse(value);
  if (!result.success) throw new BadRequestException('Invalid translation: provide locale, ASCII URL slug, title and summary.');
  return result.data;
}

export function parseCatalogQuery(value: Record<string, unknown>) {
  const parsed = z.object({
    locale: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/).default('gu'),
    kind: z.enum(['product', 'service']).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    offset: z.coerce.number().int().min(0).max(10000).default(0),
  }).safeParse(value);
  if (!parsed.success) throw new BadRequestException('Invalid catalog query.');
  return parsed.data;
}

export function checkedCatalogId(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new BadRequestException('Invalid catalog item ID.');
  }
  return value;
}
