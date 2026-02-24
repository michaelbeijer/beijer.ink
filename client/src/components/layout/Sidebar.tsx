import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PenLine, FolderPlus, LogOut, Sun, Moon } from 'lucide-react';
import { getNotebooks, createNotebook, deleteNotebook, updateNotebook } from '../../api/notebooks';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { flattenNotebookTree } from '../../utils/flattenNotebookTree';
import { useTreeKeyboardNav } from '../../hooks/useTreeKeyboardNav';
import { SidebarNotebookNode } from './SidebarNotebookNode';
import { SidebarDropRoot } from './SidebarDropRoot';
import type { Notebook } from '../../types/notebook';

interface SidebarProps {
  selectedNotebookId: string | null;
  onSelectNotebook: (id: string) => void;
  onClose?: () => void;
  activeItemType?: 'notebook' | 'note' | null;
  overId?: string | null;
}

export function Sidebar({ selectedNotebookId, onSelectNotebook, onClose, activeItemType, overId }: SidebarProps) {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  const { data: notebooks = [] } = useQuery({
    queryKey: ['notebooks'],
    queryFn: getNotebooks,
  });

  const createMutation = useMutation({
    mutationFn: createNotebook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notebooks'] }),
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

  const { focusedId, handleKeyDown, handleFocus } = useTreeKeyboardNav({
    nodes: flatNodes,
    expandedIds,
    toggleExpand,
    onSelect: (id) => {
      onSelectNotebook(id);
      onClose?.();
    },
  });

  function handleCreate() {
    createMutation.mutate({ name: 'New Notebook' });
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

  const isDragging = !!activeItemType;

  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-900 dark:text-white">Beijer.ink</span>
        </div>
        <button
          onClick={handleCreate}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="New notebook"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Notebook list */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-0.5"
        role="tree"
        aria-label="Notebooks"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      >
        {flatNodes.map((node) => (
          <SidebarNotebookNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedNotebookId}
            isFocused={node.id === focusedId}
            isDropTarget={node.id === overId}
            editingId={editingId}
            editName={editName}
            contextMenuId={contextMenuId}
            onSelect={onSelectNotebook}
            onToggleExpand={toggleExpand}
            onStartRename={handleStartRename}
            onRename={handleRename}
            onCancelRename={() => setEditingId(null)}
            onDelete={handleDelete}
            onContextMenu={setContextMenuId}
            onEditNameChange={setEditName}
            onClose={onClose}
          />
        ))}

        {isDragging && activeItemType === 'notebook' && <SidebarDropRoot />}

        {notebooks.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No notebooks yet.
            <br />
            <button onClick={handleCreate} className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block">
              Create one
            </button>
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-0.5">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
