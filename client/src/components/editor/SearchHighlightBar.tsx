import { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchHighlightBarProps {
  query: string;
  matchCount: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function SearchHighlightBar({
  query,
  matchCount,
  currentIndex,
  onNext,
  onPrev,
  onClose,
}: SearchHighlightBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    barRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onPrev();
    }
  }

  return (
    <div
      ref={barRef}
      className="absolute top-2 right-4 z-10 flex items-center gap-1.5 bg-card border border-edge rounded-lg shadow-lg px-3 py-1.5 text-sm focus:outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <span className="text-ink-secondary whitespace-nowrap">
        {matchCount > 0 ? (
          <>
            <span className="font-medium">{currentIndex + 1}</span>
            <span className="text-ink-faint"> of </span>
            <span className="font-medium">{matchCount}</span>
          </>
        ) : (
          <span className="text-ink-faint">
            No matches for "{query}"
          </span>
        )}
      </span>

      <button
        onClick={onPrev}
        disabled={matchCount === 0}
        className="p-0.5 text-ink-muted hover:text-ink disabled:opacity-30 rounded transition-colors"
        title="Previous match"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        className="p-0.5 text-ink-muted hover:text-ink disabled:opacity-30 rounded transition-colors"
        title="Next match"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
      <button
        onClick={onClose}
        className="p-0.5 text-ink-muted hover:text-ink rounded transition-colors"
        title="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
