import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pin, PinOff, Maximize2, Minimize2, Type, Pencil, Eye, Columns2 } from 'lucide-react';

import { getNoteById, updateNote, deleteNote } from '../../api/notes';
import type { NoteSummary } from '../../types/note';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useCodeMirror } from '../../hooks/useCodeMirror';
import { useTheme } from '../../contexts/ThemeContext';
import { stripMarkdown } from '../../utils/stripMarkdown';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { SearchHighlightBar } from './SearchHighlightBar';

const TOOLBAR_KEY = 'beijer-ink-toolbar';
const MODE_KEY = 'beijer-ink-editor-mode';

type EditorMode = 'edit' | 'preview' | 'split';

interface NoteEditorProps {
  noteId: string;
  onNoteDeleted?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  searchQuery?: string | null;
  onClearSearch?: () => void;
}

export function NoteEditor({ noteId, onNoteDeleted, isFullscreen, onToggleFullscreen, searchQuery, onClearSearch }: NoteEditorProps) {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { save } = useAutoSave(noteId);
  const isLoadingRef = useRef(false);
  const saveRef = useRef(save);
  saveRef.current = save;
  const [charCount, setCharCount] = useState(0);
  const [previewContent, setPreviewContent] = useState('');
  const [showToolbar, setShowToolbar] = useState(() => {
    return localStorage.getItem(TOOLBAR_KEY) === 'true';
  });
  const [editorMode, setEditorMode] = useState<EditorMode>(() => {
    return (localStorage.getItem(MODE_KEY) as EditorMode) || 'edit';
  });
  const [searchBar, setSearchBar] = useState<{ query: string; matchCount: number; currentIndex: number } | null>(null);
  const pendingSearchRef = useRef<string | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setCharCount(value.length);
      setPreviewContent(value);
      // User started typing — clear search highlights
      setSearchBar(null);
      if (!isLoadingRef.current) {
        const firstLine = stripMarkdown(value.split('\n')[0]?.trim() || '') || 'Untitled';
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

  const { containerRef, view, setDoc, focus, setSearch, clearSearch, getSearchState, goToMatch, nextMatch, prevMatch } = useCodeMirror({
    onChange: handleChange,
    placeholder: 'Start writing...',
    dark: theme === 'dark',
  });

  const { data: note } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNoteById(noteId),
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

  // Stash incoming search query so we can apply it after content loads
  useEffect(() => {
    if (searchQuery) {
      pendingSearchRef.current = searchQuery;
      // If the note is already loaded, apply search immediately
      if (note) {
        applyPendingSearch();
      }
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyPendingSearch() {
    const query = pendingSearchRef.current;
    if (!query) return;
    pendingSearchRef.current = null;
    queueMicrotask(() => {
      setSearch(query);
      const state = getSearchState();
      setSearchBar({
        query,
        matchCount: state.matches.length,
        currentIndex: state.currentIndex,
      });
      if (state.matches.length > 0) {
        goToMatch(0);
      }
    });
  }

  // Load note content into CodeMirror
  useEffect(() => {
    if (note) {
      isLoadingRef.current = true;
      setDoc(note.content || '');
      setCharCount((note.content || '').length);
      setPreviewContent(note.content || '');
      isLoadingRef.current = false;

      // Apply pending search after document is set
      applyPendingSearch();
    }
  }, [note, setDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus on load (only in edit modes)
  useEffect(() => {
    if (note && editorMode !== 'preview') focus();
  }, [note, focus, editorMode]);

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

  // Persist editor mode
  const changeMode = useCallback((mode: EditorMode) => {
    setEditorMode(mode);
    localStorage.setItem(MODE_KEY, mode);
  }, []);

  const handleDismissSearch = useCallback(() => {
    clearSearch();
    setSearchBar(null);
    onClearSearch?.();
  }, [clearSearch, onClearSearch]);

  const handleNextMatch = useCallback(() => {
    nextMatch();
    const state = getSearchState();
    setSearchBar((prev) => prev ? { ...prev, currentIndex: state.currentIndex, matchCount: state.matches.length } : null);
  }, [nextMatch, getSearchState]);

  const handlePrevMatch = useCallback(() => {
    prevMatch();
    const state = getSearchState();
    setSearchBar((prev) => prev ? { ...prev, currentIndex: state.currentIndex, matchCount: state.matches.length } : null);
  }, [prevMatch, getSearchState]);

  const showEditor = editorMode === 'edit' || editorMode === 'split';
  const showPreview = editorMode === 'preview' || editorMode === 'split';

  const modeButtonClass = (mode: EditorMode) =>
    `p-1.5 rounded transition-colors ${
      editorMode === mode
        ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/30'
        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Action bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
        {/* Mode toggle — left side */}
        <div className="flex items-center gap-0.5 mr-auto">
          <button onClick={() => changeMode('edit')} className={modeButtonClass('edit')} title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => changeMode('preview')} className={modeButtonClass('preview')} title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => changeMode('split')} className={modeButtonClass('split')} title="Split view">
            <Columns2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right-side actions */}
        {showEditor && (
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
        )}
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

      {/* Markdown toolbar — only in edit/split modes */}
      {showToolbar && showEditor && <MarkdownToolbar view={view} />}

      {/* Editor / Preview area */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Search highlight bar */}
        {searchBar && showEditor && (
          <SearchHighlightBar
            query={searchBar.query}
            matchCount={searchBar.matchCount}
            currentIndex={searchBar.currentIndex}
            onNext={handleNextMatch}
            onPrev={handlePrevMatch}
            onClose={handleDismissSearch}
          />
        )}

        {/* Editor — always mounted to preserve EditorView state, hidden in preview mode */}
        <div
          ref={containerRef}
          className={`min-h-0 overflow-hidden ${
            showEditor
              ? editorMode === 'split' ? 'w-1/2' : 'w-full'
              : 'w-0 overflow-hidden'
          }`}
        />

        {editorMode === 'split' && (
          <div className="w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
        )}

        {showPreview && (
          <div className={`${editorMode === 'split' ? 'w-1/2' : 'w-full'} min-h-0 overflow-auto`}>
            <MarkdownPreview content={previewContent} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="px-4 py-1 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
        {charCount} characters
      </div>
    </div>
  );
}
