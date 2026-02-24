import api from './client';
import type { Note, NoteSummary } from '../types/note';

export async function getNotesByNotebook(notebookId: string): Promise<NoteSummary[]> {
  const { data } = await api.get<NoteSummary[]>(`/notes/notebook/${notebookId}`);
  return data;
}

export async function getNoteById(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
}

export async function createNote(body: {
  notebookId: string;
  title?: string;
  content?: string;
}): Promise<Note> {
  const { data } = await api.post<Note>('/notes', body);
  return data;
}

export async function updateNote(
  id: string,
  body: Partial<Pick<Note, 'title' | 'content' | 'notebookId' | 'isPinned'>>
): Promise<Note> {
  const { data } = await api.patch<Note>(`/notes/${id}`, body);
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}

export async function moveNote(id: string, notebookId: string): Promise<Note> {
  const { data } = await api.patch<Note>(`/notes/${id}/move`, { notebookId });
  return data;
}

export async function setNoteTags(noteId: string, tagIds: string[]): Promise<Note> {
  const { data } = await api.put<Note>(`/notes/${noteId}/tags`, { tagIds });
  return data;
}
