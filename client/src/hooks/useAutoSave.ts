import { useRef, useCallback } from 'react';
import { updateNote } from '../api/notes';

export function useAutoSave(noteId: string | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSavedRef = useRef<string>('');

  const save = useCallback(
    (content: string, title?: string) => {
      if (!noteId) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        if (content === lastSavedRef.current) return;
        lastSavedRef.current = content;

        try {
          const body: Record<string, string> = { content };
          if (title !== undefined) body.title = title;
          await updateNote(noteId, body);
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, 1000);
    },
    [noteId]
  );

  const saveNow = useCallback(
    async (content: string, title?: string) => {
      if (!noteId) return;
      if (timerRef.current) clearTimeout(timerRef.current);

      lastSavedRef.current = content;
      const body: Record<string, string> = { content };
      if (title !== undefined) body.title = title;
      await updateNote(noteId, body);
    },
    [noteId]
  );

  return { save, saveNow };
}
