import { prisma } from '../lib/prisma.js';

function extractTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() || 'Untitled';
  return firstLine
    .replace(/^#{1,6}\s+/, '')                    // heading markers
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')     // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')      // links
    .replace(/(\*\*|__)(.*?)\1/g, '$2')            // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')               // italic
    .replace(/~~(.*?)~~/g, '$1')                   // strikethrough
    .replace(/`([^`]*)`/g, '$1')                   // inline code
    .trim() || 'Untitled';
}

export async function getNotesInNotebook(notebookId: string) {
  return prisma.note.findMany({
    where: { notebookId },
    select: {
      id: true,
      title: true,
      content: true,
      isPinned: true,
      sortOrder: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  });
}

export async function getRootNotes() {
  return prisma.note.findMany({
    where: { notebookId: null },
    select: {
      id: true,
      title: true,
      content: true,
      isPinned: true,
      sortOrder: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  });
}

export async function getNoteById(id: string) {
  return prisma.note.findUnique({
    where: { id },
    include: {
      notebook: { select: { id: true, name: true } },
    },
  });
}

export async function createNote(data: {
  content?: string;
  notebookId?: string;
}) {
  const content = data.content || '';
  const title = extractTitle(content);

  return prisma.note.create({
    data: {
      title,
      content,
      notebookId: data.notebookId,
    },
  });
}

export async function updateNote(
  id: string,
  data: {
    content?: string;
    notebookId?: string;
    isPinned?: boolean;
    sortOrder?: number;
  }
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.content !== undefined) {
    updateData.title = extractTitle(data.content);
  }

  return prisma.note.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteNote(id: string) {
  await prisma.note.delete({ where: { id } });
}

export async function moveNote(id: string, notebookId: string | null) {
  return prisma.note.update({
    where: { id },
    data: { notebookId },
  });
}
