import { useState, useCallback } from 'react';

interface UseListKeyboardNavOptions {
  items: { id: string }[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export function useListKeyboardNav({ items, onSelect, selectedId }: UseListKeyboardNavOptions) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (items.length === 0) return;

      const currentIndex = focusedId ? items.findIndex((item) => item.id === focusedId) : -1;

      function moveTo(id: string) {
        setFocusedId(id);
        onSelect(id);
        document.getElementById(`listitem-${id}`)?.scrollIntoView({ block: 'nearest' });
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          moveTo(items[next].id);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          moveTo(items[prev].id);
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
          if (items.length > 0) {
            moveTo(items[0].id);
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (items.length > 0) {
            moveTo(items[items.length - 1].id);
          }
          break;
        }
      }
    },
    [items, focusedId, onSelect]
  );

  // On focus: start from the currently selected item
  const handleFocus = useCallback(
    (e: React.FocusEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;

      if (selectedId && items.some((item) => item.id === selectedId)) {
        setFocusedId(selectedId);
      } else if (items.length > 0) {
        setFocusedId(items[0].id);
      }
    },
    [selectedId, items]
  );

  // On blur: clear focus ring when focus leaves the list
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setFocusedId(null);
    },
    []
  );

  return { focusedId, setFocusedId, handleKeyDown, handleFocus, handleBlur };
}
