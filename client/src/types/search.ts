export interface SearchResult {
  id: string;
  title: string;
  headline: string;
  notebookId: string;
  notebookName: string;
  rank: number;
  updatedAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}
