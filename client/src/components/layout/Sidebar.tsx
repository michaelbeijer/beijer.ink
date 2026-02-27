import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PenLine, FolderPlus, FilePlus, LogOut, Sun, Moon } from 'lucide-react';
import { getNotebooks, createNotebook, deleteNotebook, updateNotebook } from '../../api/notebooks';
import { getRootNotes, createNote, deleteNote, moveNote } from '../../api/notes';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { flattenNotebookTree } from '../../utils/flattenNotebookTree';
import { useTreeKeyboardNav } from '../../hooks/useTreeKeyboardNav';
import { SidebarNotebookNode } from './SidebarNotebookNode';
import { SidebarRootNote } from './SidebarRootNote';
import type { Notebook } from '../../types/notebook';

interface SidebarProps {
  selectedNotebookId: string | null;
  selectedNoteId: string | null;
  onSelectNotebook: (id: string) => void;
  onSelectRootNote: (noteId: string) => void;
  onClose?: () => void;
}

export function Sidebar({ selectedNotebookId, selectedNoteId, onSelectNotebook, onSelectRootNote, onClose }: SidebarProps) {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  const { data: notebooks = [] } = useQuery({
    queryKey: ['notebooks'],
    queryFn: getNotebooks,
  });

  const createMutation = useMutation({
    mutationFn: createNotebook,
    onSuccess: (nb) => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      // Auto-expand parent if created as child
      if (nb.parentId) {
        setExpandedIds((prev) => new Set([...prev, nb.parentId!]));
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotebook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notebooks'] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateNotebook(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      setEditingId(null);
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, parentId }: { id: string; parentId: string | null }) =>
      updateNotebook(id, { parentId }),
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      if (parentId) {
        setExpandedIds((prev) => new Set([...prev, parentId]));
      }
    },
  });

  const { data: rootNotes = [] } = useQuery({
    queryKey: ['notes', 'root'],
    queryFn: getRootNotes,
  });

  const createRootNoteMutation = useMutation({
    mutationFn: () => createNote({}),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'root'] });
      onSelectRootNote(note.id);
    },
  });

  const deleteRootNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', 'root'] }),
  });

  const moveNoteToNotebookMutation = useMutation({
    mutationFn: ({ noteId, notebookId }: { noteId: string; notebookId: string }) =>
      moveNote(noteId, notebookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', 'root'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const flatNodes = useMemo(
    () => flattenNotebookTree(notebooks, expandedIds),
    [notebooks, expandedIds]
  );

  const { focusedId, setFocusedId, handleKeyDown, handleFocus, handleBlur } = useTreeKeyboardNav({
    nodes: flatNodes,
    expandedIds,
    toggleExpand,
    onSelect: (id) => {
      onSelectNotebook(id);
      onClose?.();
    },
    selectedId: selectedNotebookId,
  });

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenuId) return;
    function handleClick(e: MouseEvent) {
      if (treeRef.current && !treeRef.current.contains(e.target as Node)) {
        setContextMenuId(null);
      }
    }
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [contextMenuId]);

  function handleCreate() {
    createMutation.mutate({ name: 'New Notebook' });
  }

  function handleCreateChild(parentId: string) {
    createMutation.mutate({ name: 'New Notebook', parentId });
  }

  function handleStartRename(nb: Notebook) {
    setEditingId(nb.id);
    setEditName(nb.name);
    setContextMenuId(null);
  }

  function handleRename(id: string) {
    if (editName.trim()) {
      renameMutation.mutate({ id, name: editName.trim() });
    } else {
      setEditingId(null);
    }
  }

  function handleDelete(id: string) {
    if (confirm('Delete this notebook and all its notes?')) {
      deleteMutation.mutate(id);
      setContextMenuId(null);
    }
  }

  function handleMove(id: string, parentId: string | null) {
    moveMutation.mutate({ id, parentId });
  }

  function handleCreateRootNote() {
    createRootNoteMutation.mutate();
  }

  function handleDeleteRootNote(id: string) {
    if (confirm('Delete this note?')) {
      deleteRootNoteMutation.mutate(id);
      setContextMenuId(null);
    }
  }

  function handleMoveNoteToNotebook(noteId: string, notebookId: string) {
    moveNoteToNotebookMutation.mutate({ noteId, notebookId });
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-sm text-slate-900 dark:text-white">Beijer.ink</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleCreateRootNote}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
            title="New note"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
            title="New notebook"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notebook tree */}
      <div
        ref={treeRef}
        className="flex-1 overflow-y-auto px-1.5 py-1.5"
        role="tree"
        aria-label="Notebooks"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {flatNodes.map((node) => (
          <SidebarNotebookNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedNotebookId}
            isFocused={node.id === focusedId}
            isDropTarget={false}
            editingId={editingId}
            editName={editName}
            contextMenuId={contextMenuId}
            notebooks={notebooks}
            onSelect={(id: string) => { onSelectNotebook(id); setFocusedId(id); }}
            onToggleExpand={toggleExpand}
            onStartRename={handleStartRename}
            onRename={handleRename}
            onCancelRename={() => setEditingId(null)}
            onDelete={handleDelete}
            onContextMenu={setContextMenuId}
            onEditNameChange={setEditName}
            onMove={handleMove}
            onCreateChild={handleCreateChild}
            onClose={onClose}
          />
        ))}

        {notebooks.length === 0 && rootNotes.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No notebooks yet.
            <br />
            <button onClick={handleCreate} className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
              Create one
            </button>
          </p>
        )}

        {/* Root notes */}
        {rootNotes.length > 0 && (
          <>
            {notebooks.length > 0 && (
              <div className="mt-2 mb-1 px-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600">
                  Notes
                </span>
              </div>
            )}
            {rootNotes.map((note) => (
              <SidebarRootNote
                key={note.id}
                note={note}
                isSelected={note.id === selectedNoteId && selectedNotebookId === null}
                contextMenuId={contextMenuId}
                notebooks={notebooks}
                onSelect={(id) => { onSelectRootNote(id); onClose?.(); }}
                onDelete={handleDeleteRootNote}
                onContextMenu={setContextMenuId}
                onMoveToNotebook={handleMoveNoteToNotebook}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-1.5">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
