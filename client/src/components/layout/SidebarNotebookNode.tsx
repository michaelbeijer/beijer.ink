import { useCallback } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  MoreHorizontal,
  Trash2,
  Edit3,
} from 'lucide-react';
import type { FlatTreeNode } from '../../utils/flattenNotebookTree';
import type { Notebook } from '../../types/notebook';

interface SidebarNotebookNodeProps {
  node: FlatTreeNode;
  isSelected: boolean;
  isFocused: boolean;
  isDropTarget: boolean;
  editingId: string | null;
  editName: string;
  contextMenuId: string | null;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onStartRename: (nb: Notebook) => void;
  onRename: (id: string) => void;
  onCancelRename: () => void;
  onDelete: (id: string) => void;
  onContextMenu: (id: string | null) => void;
  onEditNameChange: (name: string) => void;
  onClose?: () => void;
}

export function SidebarNotebookNode({
  node,
  isSelected,
  isFocused,
  isDropTarget,
  editingId,
  editName,
  contextMenuId,
  onSelect,
  onToggleExpand,
  onStartRename,
  onRename,
  onCancelRename,
  onDelete,
  onContextMenu,
  onEditNameChange,
  onClose,
}: SidebarNotebookNodeProps) {
  const nb = node.notebook;
  const isEditing = editingId === nb.id;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: nb.id,
    data: { type: 'notebook', item: nb },
  });

  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
    isDragging,
  } = useDraggable({
    id: nb.id,
    data: { type: 'notebook', item: nb },
  });

  const mergedRef = useCallback(
    (node: HTMLElement | null) => {
      setDropRef(node);
      setDragRef(node);
    },
    [setDropRef, setDragRef]
  );

  const showDropHighlight = isDropTarget || isOver;

  return (
    <div
      ref={mergedRef}
      id={`treeitem-${nb.id}`}
      {...attributes}
      {...listeners}
      role="treeitem"
      aria-level={node.depth + 1}
      aria-expanded={node.hasChildren ? node.isExpanded : undefined}
      aria-selected={isSelected}
      className={`group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        showDropHighlight
          ? 'ring-2 ring-blue-500 ring-inset bg-blue-600/10'
          : isSelected
            ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
      } ${isFocused ? 'outline outline-2 outline-blue-500 outline-offset-[-2px]' : ''} ${
        isDragging ? 'opacity-30' : ''
      }`}
      style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
      onClick={() => {
        onSelect(nb.id);
        onClose?.();
      }}
    >
      {node.hasChildren ? (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(nb.id);
          }}
          className="p-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded"
        >
          {node.isExpanded ? (
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
          onChange={(e) => onEditNameChange(e.target.value)}
          onBlur={() => onRename(nb.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRename(nb.id);
            if (e.key === 'Escape') onCancelRename();
          }}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-sm truncate">{nb.name}</span>
      )}

      <span className="text-xs text-slate-400 dark:text-slate-500">{nb._count.notes}</span>

      <div className="relative">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(contextMenuId === nb.id ? null : nb.id);
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
                onStartRename(nb);
              }}
            >
              <Edit3 className="w-3.5 h-3.5" /> Rename
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(nb.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
