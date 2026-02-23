import api from './client';
import type { Tag } from '../types/tag';

export async function getTags(): Promise<Tag[]> {
  const { data } = await api.get<Tag[]>('/tags');
  return data;
}

export async function createTag(body: { name: string; color?: string }): Promise<Tag> {
  const { data } = await api.post<Tag>('/tags', body);
  return data;
}

export async function updateTag(id: string, body: Partial<Tag>): Promise<Tag> {
  const { data } = await api.patch<Tag>(`/tags/${id}`, body);
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  await api.delete(`/tags/${id}`);
}
