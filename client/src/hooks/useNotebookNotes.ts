import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getNotesByNotebook } from '../api/notes';
import type { NoteSummary } from '../types/note';

export function useNotebookNotes(expandedIds: Set<string>) {
  const ids = useMemo(() => Array.from(expandedIds), [expandedIds]);

  const queries = useQueries({
    queries: ids.map((notebookId) => ({
      queryKey: ['notes', notebookId],
      queryFn: () => getNotesByNotebook(notebookId),
      staleTime: 30_000,
    })),
  });

  const notesMap = useMemo(() => {
    const map = new Map<string, NoteSummary[]>();
    ids.forEach((id, index) => {
      const data = queries[index]?.data;
      if (data) map.set(id, data);
    });
    return map;
  }, [ids, queries]);

  return { notesMap };
}
