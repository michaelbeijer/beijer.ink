import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import type { Editor } from '@tiptap/react';
import { X, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react';

interface SearchBarProps {
  editor: Editor;
  onClose: () => void;
}

export function SearchBar({ editor, onClose }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const storage = editor.extensionStorage.searchAndReplace;
  const resultCount = storage?.results?.length || 0;
  const currentIndex = storage?.currentIndex || 0;

  useEffect(() => {
    (editor.commands as any).setSearchTerm(searchTerm);
  }, [editor, searchTerm]);

  useEffect(() => {
    (editor.commands as any).setReplaceTerm(replaceTerm);
  }, [editor, replaceTerm]);

  useEffect(() => {
    (editor.commands as any).setCaseSensitive(caseSensitive);
  }, [editor, caseSensitive]);

  useEffect(() => {
    return () => {
      (editor.commands as any).setSearchTerm('');
    };
  }, [editor]);

  const next = useCallback(() => {
    (editor.commands as any).nextSearchResult();
  }, [editor]);

  const prev = useCallback(() => {
    (editor.commands as any).previousSearchResult();
  }, [editor]);

  const replace = useCallback(() => {
    (editor.commands as any).replaceCurrentResult();
  }, [editor]);

  const replaceAll = useCallback(() => {
    (editor.commands as any).replaceAllResults();
  }, [editor]);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.shiftKey ? prev() : next();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-1 flex-1 min-w-[200px]">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find..."
          className="flex-1 bg-slate-900 text-white text-sm px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <span className="text-xs text-slate-500 min-w-[50px] text-center">
          {resultCount > 0 ? `${currentIndex + 1}/${resultCount}` : '0/0'}
        </span>
        <button onClick={prev} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="Previous">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={next} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="Next">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`p-1 rounded text-xs font-bold ${caseSensitive ? 'bg-blue-600/30 text-blue-400' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
          title="Case sensitive"
        >
          Aa
        </button>
      </div>

      <div className="flex items-center gap-1 flex-1 min-w-[200px]">
        <input
          type="text"
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Replace..."
          className="flex-1 bg-slate-900 text-white text-sm px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onClick={replace} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="Replace">
          <Replace className="w-3.5 h-3.5" />
        </button>
        <button onClick={replaceAll} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="Replace all">
          <ReplaceAll className="w-3.5 h-3.5" />
        </button>
      </div>

      <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="Close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
