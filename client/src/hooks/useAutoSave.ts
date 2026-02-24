import { useRef, useCallback, useEffect } from 'react';
import { updateNote } from '../api/notes';

export function useAutoSave(noteId: string | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingRef = useRef<{ content: string; title?: string } | null>(null);

  const save = useCallback(
    (content: string, title?: string) => {
      if (!noteId) return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      pendingRef.current = { content, title };

      timerRef.current = setTimeout(async () => {
        timerRef.current = undefined;
        pendingRef.current = null;

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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      pendingRef.current = null;

      const body: Record<string, string> = { content };
      if (title !== undefined) body.title = title;
      await updateNote(noteId, body);
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
      if (pending && currentNoteId) {
        pendingRef.current = null;
        const body: Record<string, string> = { content: pending.content };
        if (pending.title !== undefined) body.title = pending.title;
        updateNote(currentNoteId, body).catch((err) =>
          console.error('Auto-save flush failed:', err)
        );
      }
    };
  }, [noteId]);

  return { save, saveNow };
}
