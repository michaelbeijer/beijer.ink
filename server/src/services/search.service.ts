import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

interface SearchFilters {
  notebookId?: string;
  tagId?: string;
  limit: number;
  offset: number;
}

interface SearchResult {
  id: string;
  title: string;
  headline: string;
  notebookId: string;
  notebookName: string;
  rank: number;
  updatedAt: Date;
}

export async function searchNotes(query: string, filters: SearchFilters) {
  const { notebookId, limit, offset } = filters;

  const notebookFilter = notebookId
    ? Prisma.sql`AND n.notebook_id = ${notebookId}`
    : Prisma.empty;

  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      n.id,
      n.title,
      n.notebook_id AS "notebookId",
      nb.name AS "notebookName",
      n.updated_at AS "updatedAt",
      ts_rank(n.search_vector, plainto_tsquery('english', ${query})) AS rank,
      ts_headline(
        'english',
        n.plain_text,
        plainto_tsquery('english', ${query}),
        'StartSel=<mark>, StopSel=</mark>, MaxWords=60, MinWords=20, MaxFragments=2'
      ) AS headline
    FROM notes n
    JOIN notebooks nb ON nb.id = n.notebook_id
    WHERE n.search_vector @@ plainto_tsquery('english', ${query})
    ${notebookFilter}
    ORDER BY rank DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const countResult = await prisma.$queryRaw<[{ total: number }]>`
    SELECT count(*)::int AS total
    FROM notes n
    WHERE n.search_vector @@ plainto_tsquery('english', ${query})
    ${notebookFilter}
  `;

  return { results, total: countResult[0].total };
}
