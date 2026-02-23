import api from './client';
import type { SearchResponse } from '../types/search';

export async function searchNotes(params: {
  q: string;
  notebookId?: string;
  limit?: number;
  offset?: number;
}): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/search', { params });
  return data;
}
