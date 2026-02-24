import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PenLine,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Folder,
  MoreHorizontal,
  Trash2,
  Edit3,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { getNotebooks, createNotebook, deleteNotebook, updateNotebook } from '../../api/notebooks';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { Notebook } from '../../types/notebook';

interface SidebarProps {
  selectedNotebookId: string | null;
  onSelectNotebook: (id: string) => void;
  onClose?: () => void;
}

export function Sidebar({ selectedNotebookId, onSelectNotebook, onClose }: SidebarProps) {
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

  const rootNotebooks = notebooks.filter((nb: Notebook) => !nb.parentId);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

  function renderNotebook(nb: Notebook, depth = 0) {
    const children = notebooks.filter((c: Notebook) => c.parentId === nb.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(nb.id);
    const isSelected = nb.id === selectedNotebookId;
    const isEditing = editingId === nb.id;

    return (
      <div key={nb.id}>
        <div
          className={`group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            onSelectNotebook(nb.id);
            onClose?.();
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(nb.id);
              }}
              className="p-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4.5" />
          )}

          <Folder className="w-4 h-4 shrink-0" />

          {isEditing ? (
            <input
              className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-sm px-1 py-0.5 rounded outline-none"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRename(nb.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(nb.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm truncate">{nb.name}</span>
          )}

          <span className="text-xs text-slate-400 dark:text-slate-500">{nb._count.notes}</span>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenuId(contextMenuId === nb.id ? null : nb.id);
              }}
              className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-slate-300 dark:hover:bg-slate-700 rounded transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {contextMenuId === nb.id && (
              <div className="absolute right-0 top-6 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartRename(nb);
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Rename
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(nb.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && children.map((c: Notebook) => renderNotebook(c, depth + 1))}
      </div>
    );
  }

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
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {rootNotebooks.map((nb: Notebook) => renderNotebook(nb))}

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
