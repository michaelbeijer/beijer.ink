import { useState, useCallback } from 'react';
import type { FlatTreeNode } from '../utils/flattenNotebookTree';

interface UseTreeKeyboardNavOptions {
  nodes: FlatTreeNode[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  onSelect: (node: FlatTreeNode) => void;
  selectedId: string | null;
}

export function useTreeKeyboardNav({
  nodes,
  expandedIds,
  toggleExpand,
  onSelect,
  selectedId,
}: UseTreeKeyboardNavOptions) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (nodes.length === 0) return;

      const currentIndex = focusedId ? nodes.findIndex((n) => n.id === focusedId) : -1;
      const current = currentIndex >= 0 ? nodes[currentIndex] : null;

      function moveTo(id: string) {
        const node = nodes.find((n) => n.id === id);
        setFocusedId(id);
        if (node) onSelect(node);
        document.getElementById(`treeitem-${id}`)?.scrollIntoView({ block: 'nearest' });
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = currentIndex < nodes.length - 1 ? currentIndex + 1 : 0;
          moveTo(nodes[next].id);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : nodes.length - 1;
          moveTo(nodes[prev].id);
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (current?.type === 'notebook' && current.hasChildren && !current.isExpanded) {
            toggleExpand(current.id);
          } else if (current?.type === 'notebook' && current.hasChildren && current.isExpanded) {
            const childIndex = currentIndex + 1;
            if (childIndex < nodes.length && nodes[childIndex].depth > current.depth) {
              moveTo(nodes[childIndex].id);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (current?.type === 'notebook' && current.hasChildren && expandedIds.has(current.id)) {
            toggleExpand(current.id);
          } else if (current?.parentId) {
            const parentNode = nodes.find((n) => n.id === current.parentId);
            if (parentNode) moveTo(parentNode.id);
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (focusedId) {
            const node = nodes.find((n) => n.id === focusedId);
            if (node) onSelect(node);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (nodes.length > 0) {
            moveTo(nodes[0].id);
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (nodes.length > 0) {
            moveTo(nodes[nodes.length - 1].id);
          }
          break;
        }
      }
    },
    [nodes, focusedId, expandedIds, toggleExpand, onSelect]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;

      if (selectedId && nodes.some((n) => n.id === selectedId)) {
        setFocusedId(selectedId);
      } else if (nodes.length > 0) {
        setFocusedId(nodes[0].id);
      }
    },
    [selectedId, nodes]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setFocusedId(null);
    },
    []
  );

  return { focusedId, setFocusedId, handleKeyDown, handleFocus, handleBlur };
}
