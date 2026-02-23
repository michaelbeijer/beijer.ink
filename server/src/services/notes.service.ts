import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { htmlToPlainText } from '../lib/htmlToText.js';

async function updateSearchVector(noteId: string) {
  await prisma.$executeRaw`
    UPDATE notes SET search_vector =
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(plain_text, '')), 'B')
    WHERE id = ${noteId}
  `;
}

export async function getNotesInNotebook(notebookId: string) {
  return prisma.note.findMany({
    where: { notebookId },
    select: {
      id: true,
      title: true,
      isPinned: true,
      sortOrder: true,
      updatedAt: true,
      createdAt: true,
      plainText: true,
      tags: { include: { tag: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
  });
}

export async function getNoteById(id: string) {
  return prisma.note.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      notebook: { select: { id: true, name: true } },
    },
  });
}

export async function createNote(data: {
  title?: string;
  content?: string;
  notebookId: string;
  tagIds?: string[];
}) {
  const plainText = data.content ? htmlToPlainText(data.content) : '';

  const note = await prisma.note.create({
    data: {
      title: data.title || 'Untitled',
      content: data.content || '',
      plainText,
      notebookId: data.notebookId,
      tags: data.tagIds?.length
        ? { create: data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  await updateSearchVector(note.id);
  return note;
}

export async function updateNote(
  id: string,
  data: {
    title?: string;
    content?: string;
    notebookId?: string;
    isPinned?: boolean;
    sortOrder?: number;
  }
) {
  const updateData: Record<string, unknown> = { ...data };

  if (data.content !== undefined) {
    updateData.plainText = htmlToPlainText(data.content);
  }

  const note = await prisma.note.update({
    where: { id },
    data: updateData,
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (data.title !== undefined || data.content !== undefined) {
    await updateSearchVector(id);
  }

  return note;
}

export async function deleteNote(id: string) {
  await prisma.note.delete({ where: { id } });
}

export async function moveNote(id: string, notebookId: string) {
  return prisma.note.update({
    where: { id },
    data: { notebookId },
  });
}

export async function setNoteTags(noteId: string, tagIds: string[]) {
  await prisma.noteTag.deleteMany({ where: { noteId } });

  if (tagIds.length > 0) {
    await prisma.noteTag.createMany({
      data: tagIds.map((tagId) => ({ noteId, tagId })),
    });
  }

  return prisma.note.findUnique({
    where: { id: noteId },
    include: { tags: { include: { tag: true } } },
  });
}
