import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254).transform((v) => v.trim().toLowerCase()),
  locale: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
  acceptedPolicy: z.literal(true),
  items: z.array(z.object({
    id: z.uuid(),
    quantity: z.number().int().min(1).max(10),
  }).strict()).min(1).max(10),
}).strict().superRefine((value, ctx) => {
  if (new Set(value.items.map((item) => item.id)).size !== value.items.length) {
    ctx.addIssue({ code: 'custom', path: ['items'], message: 'Duplicate items are not allowed.' });
  }
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export function parseInquiryInput(value: unknown): InquiryInput {
  const result = inquirySchema.safeParse(value);
  if (!result.success) throw new BadRequestException('Invalid inquiry: check contact, consent and item quantities.');
  return result.data;
}
