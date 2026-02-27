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
      className="absolute top-2 right-4 z-10 flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-1.5 text-sm"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {matchCount > 0 ? (
          <>
            <span className="font-medium">{currentIndex + 1}</span>
            <span className="text-slate-400 dark:text-slate-500"> of </span>
            <span className="font-medium">{matchCount}</span>
          </>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">
            No matches for "{query}"
          </span>
        )}
      </span>

      <button
        onClick={onPrev}
        disabled={matchCount === 0}
        className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded transition-colors"
        title="Previous match"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded transition-colors"
        title="Next match"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
      <button
        onClick={onClose}
        className="p-0.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
        title="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
