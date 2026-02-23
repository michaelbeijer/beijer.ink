import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().optional(),
  notebookId: z.string().min(1),
  tagIds: z.array(z.string()).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().optional(),
  notebookId: z.string().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const moveNoteSchema = z.object({
  notebookId: z.string().min(1),
});

export const setNoteTagsSchema = z.object({
  tagIds: z.array(z.string()),
});
