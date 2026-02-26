import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pin, PinOff, Maximize2, Minimize2, Type } from 'lucide-react';

import { getNoteById, updateNote, deleteNote } from '../../api/notes';
import type { NoteSummary } from '../../types/note';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useCodeMirror } from '../../hooks/useCodeMirror';
import { useTheme } from '../../contexts/ThemeContext';
import { MarkdownToolbar } from './MarkdownToolbar';
import { Scratchpad } from '../scratchpad/Scratchpad';

const TOOLBAR_KEY = 'beijer-ink-toolbar';

interface NoteEditorProps {
  noteId: string | null;
  onNoteDeleted?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function NoteEditor({ noteId, onNoteDeleted, isFullscreen, onToggleFullscreen }: NoteEditorProps) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { save } = useAutoSave(noteId);
  const isLoadingRef = useRef(false);
  const saveRef = useRef(save);
  saveRef.current = save;
  const [charCount, setCharCount] = useState(0);
  const [showToolbar, setShowToolbar] = useState(() => {
    return localStorage.getItem(TOOLBAR_KEY) === 'true';
  });

  const handleChange = useCallback(
    (value: string) => {
      setCharCount(value.length);
      if (!isLoadingRef.current) {
        const firstLine = value.split('\n')[0]?.trim() || 'Untitled';
        queryClient.setQueriesData<NoteSummary[]>(
          { queryKey: ['notes'] },
          (old) =>
            old?.map((n) =>
              n.id === noteId ? { ...n, title: firstLine, content: value } : n
            )
        );
        saveRef.current(value);
      }
    },
    [noteId, queryClient]
  );

  const { containerRef, view, setDoc, focus } = useCodeMirror({
    onChange: handleChange,
    placeholder: 'Start writing...',
    dark: theme === 'dark',
  });

  const { data: note } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNoteById(noteId!),
    enabled: !!noteId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      onNoteDeleted?.();
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      updateNote(id, { isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
  });

  // Load note content into CodeMirror
  useEffect(() => {
    if (note) {
      isLoadingRef.current = true;
      setDoc(note.content || '');
      setCharCount((note.content || '').length);
      isLoadingRef.current = false;
    }
  }, [note, setDoc]);

  // Auto-focus on load
  useEffect(() => {
    if (note) focus();
  }, [note, focus]);

  // Escape exits fullscreen
  useEffect(() => {
    if (!isFullscreen || !onToggleFullscreen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onToggleFullscreen!();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isFullscreen, onToggleFullscreen]);

  // Persist toolbar preference
  const toggleToolbar = useCallback(() => {
    setShowToolbar((prev) => {
      const next = !prev;
      localStorage.setItem(TOOLBAR_KEY, String(next));
      return next;
    });
  }, []);

  if (!noteId) {
    return <Scratchpad />;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Action bar */}
      <div className="flex items-center justify-end gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={toggleToolbar}
          className={`p-1.5 rounded transition-colors ${
            showToolbar
              ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={showToolbar ? 'Hide formatting toolbar' : 'Show formatting toolbar'}
        >
          <Type className="w-4 h-4" />
        </button>
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
        <button
          onClick={() => {
            if (noteId && note) {
              pinMutation.mutate({ id: noteId, isPinned: !note.isPinned });
            }
          }}
          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title={note?.isPinned ? 'Unpin' : 'Pin'}
        >
          {note?.isPinned ? (
            <PinOff className="w-4 h-4" />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => {
            if (noteId && confirm('Delete this note?')) {
              deleteMutation.mutate(noteId);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Markdown toolbar */}
      {showToolbar && <MarkdownToolbar view={view} />}

      {/* CodeMirror editor */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden" />

      {/* Status bar */}
      <div className="px-4 py-1 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
        {charCount} characters
      </div>
    </div>
  );
}
