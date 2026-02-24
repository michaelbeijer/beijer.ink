import { z } from 'zod';

export const updateScratchpadSchema = z.object({
  content: z.string(),
});
