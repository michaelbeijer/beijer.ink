import { prisma } from '../lib/prisma.js';

export async function getScratchpad(userId: string) {
  const pad = await prisma.scratchpad.findUnique({
    where: { userId },
  });
  return { content: pad?.content ?? '' };
}

export async function updateScratchpad(userId: string, content: string) {
  return prisma.scratchpad.upsert({
    where: { userId },
    update: { content },
    create: { userId, content },
  });
}
