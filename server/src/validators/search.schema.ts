import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  notebookId: z.string().optional(),
  tagId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
