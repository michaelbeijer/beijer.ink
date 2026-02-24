import { useState, useCallback } from 'react';
import {
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { updateNotebook } from '../api/notebooks';
import { moveNote } from '../api/notes';
import type { Notebook } from '../types/notebook';
import type { NoteSummary } from '../types/note';

export interface ActiveDragItem {
  type: 'notebook' | 'note';
  id: string;
  data: Notebook | NoteSummary;
}

function isDescendant(notebooks: Notebook[], ancestorId: string, targetId: string): boolean {
  let current: string | null = targetId;
  const visited = new Set<string>();
  while (current) {
    if (current === ancestorId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    const nb = notebooks.find((n) => n.id === current);
    current = nb?.parentId ?? null;
  }
  return false;
}

export function useDndNotebooks(onExpandNotebook: (id: string) => void) {
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data) {
      setActiveItem({
        type: data.type,
        id: String(event.active.id),
        data: data.item,
      });
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);
      setOverId(null);

      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;
      if (!activeData || !overData) return;

      const notebooks = (queryClient.getQueryData(['notebooks']) as Notebook[]) || [];

      if (activeData.type === 'notebook') {
        const notebookId = String(active.id);
        const notebook = activeData.item as Notebook;

        if (overData.type === 'root') {
          // Move to root
          if (notebook.parentId === null) return;
          try {
            await updateNotebook(notebookId, { parentId: null });
            queryClient.invalidateQueries({ queryKey: ['notebooks'] });
          } catch (err) {
            console.error('Failed to move notebook to root:', err);
          }
        } else if (overData.type === 'notebook') {
          const targetId = String(over.id);
          // No-ops
          if (notebookId === targetId) return;
          if (notebook.parentId === targetId) return;
          if (isDescendant(notebooks, notebookId, targetId)) return;

          try {
            await updateNotebook(notebookId, { parentId: targetId });
            onExpandNotebook(targetId);
            queryClient.invalidateQueries({ queryKey: ['notebooks'] });
          } catch (err) {
            console.error('Failed to move notebook:', err);
          }
        }
      } else if (activeData.type === 'note') {
        const noteId = String(active.id).replace('note-', '');
        const note = activeData.item as NoteSummary;

        if (overData.type === 'notebook') {
          const targetNotebookId = String(over.id);
          // Check if note is already in this notebook
          // note doesn't have notebookId directly, so we just proceed
          try {
            await moveNote(noteId, targetNotebookId);
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            queryClient.invalidateQueries({ queryKey: ['notebooks'] });
          } catch (err) {
            console.error('Failed to move note:', err);
          }
        }
      }
    },
    [queryClient, onExpandNotebook]
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setOverId(null);
  }, []);

  return {
    sensors,
    activeItem,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
