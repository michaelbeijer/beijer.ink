import { useRef, useCallback, useEffect } from 'react';
import { updateNote } from '../api/notes';

export function useAutoSave(noteId: string | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingRef = useRef<string | null>(null);

  const save = useCallback(
    (content: string) => {
      if (!noteId) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      pendingRef.current = content;

      timerRef.current = setTimeout(async () => {
        timerRef.current = undefined;
        pendingRef.current = null;

        try {
          await updateNote(noteId, { content });
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, 1000);
    },
    [noteId]
  );

  const saveNow = useCallback(
    async (content: string) => {
      if (!noteId) return;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      pendingRef.current = null;

      await updateNote(noteId, { content });
    },
    [noteId]
  );

  // Flush pending save when noteId changes or component unmounts
  useEffect(() => {
    const currentNoteId = noteId;
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      const pending = pendingRef.current;
      if (pending !== null && currentNoteId) {
        pendingRef.current = null;
        updateNote(currentNoteId, { content: pending }).catch((err) =>
          console.error('Auto-save flush failed:', err)
        );
      }
    };
  }, [noteId]);

  return { save, saveNow };
}
