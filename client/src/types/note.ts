export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string | null;
  isPinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  notebook?: { id: string; name: string } | null;
}

export interface NoteSummary {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  sortOrder: number;
  updatedAt: string;
  createdAt: string;
}
