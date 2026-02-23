import { prisma } from '../lib/prisma.js';

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { notes: true } } },
  });
}

export async function createTag(data: { name: string; color?: string }) {
  return prisma.tag.create({ data });
}

export async function updateTag(id: string, data: { name?: string; color?: string }) {
  return prisma.tag.update({ where: { id }, data });
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
}
