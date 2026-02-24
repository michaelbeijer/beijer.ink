import { useState, useCallback } from 'react';

interface UseListKeyboardNavOptions {
  items: { id: string }[];
  onSelect: (id: string) => void;
}

export function useListKeyboardNav({ items, onSelect }: UseListKeyboardNavOptions) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (items.length === 0) return;

      const currentIndex = focusedId ? items.findIndex((item) => item.id === focusedId) : -1;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          setFocusedId(items[next].id);
          document.getElementById(`listitem-${items[next].id}`)?.scrollIntoView({ block: 'nearest' });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          setFocusedId(items[prev].id);
          document.getElementById(`listitem-${items[prev].id}`)?.scrollIntoView({ block: 'nearest' });
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
            setFocusedId(items[0].id);
            document.getElementById(`listitem-${items[0].id}`)?.scrollIntoView({ block: 'nearest' });
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (items.length > 0) {
            const last = items[items.length - 1];
            setFocusedId(last.id);
            document.getElementById(`listitem-${last.id}`)?.scrollIntoView({ block: 'nearest' });
          }
          break;
        }
      }
    },
    [items, focusedId, onSelect]
  );

  const handleFocus = useCallback(() => {
    if (!focusedId && items.length > 0) {
      setFocusedId(items[0].id);
    }
  }, [focusedId, items]);

  return { focusedId, setFocusedId, handleKeyDown, handleFocus };
}
