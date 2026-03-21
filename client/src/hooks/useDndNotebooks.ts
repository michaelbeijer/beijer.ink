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
import { moveNote } from '../api/notes';
import { updateNotebook } from '../api/notebooks';
import type { NoteSummary } from '../types/note';
import type { Notebook } from '../types/notebook';
import { isDescendant } from '../utils/isDescendant';

export interface ActiveDragItem {
  type: 'note' | 'notebook';
  id: string;
  data: NoteSummary | Notebook;
}

export function useDndNotebooks(notebooks: Notebook[] = []) {
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
    if (data?.type === 'note') {
      setActiveItem({
        type: 'note',
        id: String(event.active.id),
        data: data.item,
      });
    } else if (data?.type === 'notebook') {
      setActiveItem({
        type: 'notebook',
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

      try {
        // Note → Notebook: move note into notebook
        if (activeData.type === 'note' && overData.type === 'notebook') {
          const noteId = String(active.id).replace('note-', '');
          const targetNotebookId = String(over.id);
          // Don't move if already in this notebook
          if (activeData.sourceNotebookId === targetNotebookId) return;
          await moveNote(noteId, targetNotebookId);
          queryClient.invalidateQueries({ queryKey: ['notes'] });
          queryClient.invalidateQueries({ queryKey: ['notebooks'] });
        }

        // Note → Root drop zone: move note to root
        if (activeData.type === 'note' && overData.type === 'root-drop') {
          const noteId = String(active.id).replace('note-', '');
          if (activeData.sourceNotebookId === null) return; // already root
          await moveNote(noteId, null);
          queryClient.invalidateQueries({ queryKey: ['notes'] });
          queryClient.invalidateQueries({ queryKey: ['notebooks'] });
        }

        // Notebook → Notebook: reparent notebook
        if (activeData.type === 'notebook' && overData.type === 'notebook') {
          const notebookId = String(active.id);
          const targetId = String(over.id);
          // Can't drop on self
          if (notebookId === targetId) return;
          // Can't drop into own descendant
          if (isDescendant(notebooks, notebookId, targetId)) return;
          // Don't move if already child of target
          const nb = activeData.item as Notebook;
          if (nb.parentId === targetId) return;
          await updateNotebook(notebookId, { parentId: targetId });
          queryClient.invalidateQueries({ queryKey: ['notebooks'] });
        }

        // Notebook → Root drop zone: move notebook to root
        if (activeData.type === 'notebook' && overData.type === 'root-drop') {
          const notebookId = String(active.id);
          const nb = activeData.item as Notebook;
          if (nb.parentId === null) return; // already root
          await updateNotebook(notebookId, { parentId: null });
          queryClient.invalidateQueries({ queryKey: ['notebooks'] });
        }
      } catch (err) {
        console.error('Failed to move item:', err);
      }
    },
    [queryClient, notebooks]
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
