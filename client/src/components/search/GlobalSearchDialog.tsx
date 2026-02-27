import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, FileText } from 'lucide-react';
import { searchNotes } from '../../api/search';
import type { SearchResult } from '../../types/search';

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string, query: string) => void;
}

export function GlobalSearchDialog({ isOpen, onClose, onSelectNote }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setTotal(0);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const data = await searchNotes({ q, limit: 20 });
      setResults(data.results);
      setTotal(data.total);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all notes..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-slate-500">Searching...</div>
          )}

          {!loading && results.length > 0 && (
            <>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onSelectNote(result.id, query);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">{result.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{result.notebookName}</p>
                      <p
                        className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 [&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-500/30 [&_mark]:text-yellow-800 dark:[&_mark]:text-yellow-200 [&_mark]:rounded-sm [&_mark]:px-0.5"
                        dangerouslySetInnerHTML={{ __html: result.headline }}
                      />
                    </div>
                  </div>
                </button>
              ))}
              {total > results.length && (
                <div className="px-4 py-2 text-xs text-slate-500 text-center">
                  Showing {results.length} of {total} results
                </div>
              )}
            </>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-500">
              No results found for "{query}"
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              Type to search across all your notes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
