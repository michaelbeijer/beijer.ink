export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  isPinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  notebook?: { id: string; name: string };
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
