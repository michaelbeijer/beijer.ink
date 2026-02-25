import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().optional(),
  notebookId: z.string().min(1),
});

export const updateNoteSchema = z.object({
  content: z.string().optional(),
  notebookId: z.string().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const moveNoteSchema = z.object({
  notebookId: z.string().min(1),
});
