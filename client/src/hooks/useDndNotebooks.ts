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
import type { NoteSummary } from '../types/note';

export interface ActiveDragItem {
  type: 'note';
  id: string;
  data: NoteSummary;
}

export function useDndNotebooks() {
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

      // Only handle note → notebook drops
      if (activeData.type === 'note' && overData.type === 'notebook') {
        const noteId = String(active.id).replace('note-', '');
        const targetNotebookId = String(over.id);
        try {
          await moveNote(noteId, targetNotebookId);
          queryClient.invalidateQueries({ queryKey: ['notes'] });
          queryClient.invalidateQueries({ queryKey: ['notebooks'] });
        } catch (err) {
          console.error('Failed to move note:', err);
        }
      }
    },
    [queryClient]
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
