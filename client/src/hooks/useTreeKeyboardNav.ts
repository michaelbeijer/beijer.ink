import { useState, useCallback } from 'react';
import type { FlatTreeNode } from '../utils/flattenNotebookTree';

interface UseTreeKeyboardNavOptions {
  nodes: FlatTreeNode[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
}

export function useTreeKeyboardNav({
  nodes,
  expandedIds,
  toggleExpand,
  onSelect,
}: UseTreeKeyboardNavOptions) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (nodes.length === 0) return;

      const currentIndex = focusedId ? nodes.findIndex((n) => n.id === focusedId) : -1;
      const current = currentIndex >= 0 ? nodes[currentIndex] : null;

      function moveTo(id: string) {
        setFocusedId(id);
        onSelect(id);
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
          if (current?.hasChildren && !current.isExpanded) {
            toggleExpand(current.id);
          } else if (current?.hasChildren && current.isExpanded) {
            // Move to first child
            const childIndex = currentIndex + 1;
            if (childIndex < nodes.length && nodes[childIndex].depth > current.depth) {
              moveTo(nodes[childIndex].id);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (current?.hasChildren && expandedIds.has(current.id)) {
            toggleExpand(current.id);
          } else if (current?.parentId) {
            moveTo(current.parentId);
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (focusedId) onSelect(focusedId);
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

  const handleFocus = useCallback(() => {
    if (!focusedId && nodes.length > 0) {
      setFocusedId(nodes[0].id);
    }
  }, [focusedId, nodes]);

  return { focusedId, setFocusedId, handleKeyDown, handleFocus };
}
