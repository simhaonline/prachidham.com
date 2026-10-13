import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const recordInput = z.object({
  title: z.string().trim().min(1).max(160),
  data: z.record(z.string(), z.unknown()).refine((value) => Buffer.byteLength(JSON.stringify(value), 'utf8') <= 8192, 'Record data must be at most 8 KiB.').default({}),
  status: z.enum(['active', 'draft', 'submitted', 'approved', 'rejected', 'archived']).default('active'),
}).strict();

const loginInput = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
}).strict();

export type RecordInput = z.infer<typeof recordInput>;
export type LoginInput = z.infer<typeof loginInput>;

function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException({
      type: '/problems/validation-error',
      title: 'Validation error',
      status: 400,
      detail: 'The request contains invalid fields.',
      errors: result.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
  }
  return result.data;
}

export const parseRecordInput = (value: unknown) => validate(recordInput, value);
export const parseLoginInput = (value: unknown) => validate(loginInput, value);

export function parsePagination(value: Record<string, unknown>): { limit: number; offset: number } {
  const rawLimit = Number.parseInt(String(value.limit ?? '25'), 10);
  const rawOffset = Number.parseInt(String(value.offset ?? '0'), 10);
  return {
    limit: Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, rawLimit)) : 25,
    offset: Number.isFinite(rawOffset) ? Math.max(0, rawOffset) : 0,
  };
}
