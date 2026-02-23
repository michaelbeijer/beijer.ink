export interface Note {
  id: string;
  title: string;
  content: string;
  plainText: string;
  notebookId: string;
  isPinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  tags: NoteTagWithTag[];
  notebook?: { id: string; name: string };
}

export interface NoteTagWithTag {
  noteId: string;
  tagId: string;
  tag: Tag;
}

export interface NoteSummary {
  id: string;
  title: string;
  plainText: string;
  isPinned: boolean;
  sortOrder: number;
  updatedAt: string;
  createdAt: string;
  tags: NoteTagWithTag[];
}

import type { Tag } from './tag';
