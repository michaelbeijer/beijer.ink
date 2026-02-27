export interface SearchResult {
  id: string;
  title: string;
  headline: string;
  notebookId: string | null;
  notebookName: string | null;
  rank: number;
  updatedAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}
