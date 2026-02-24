import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { getScratchpad, updateScratchpad } from '../../api/scratchpad';

export function Scratchpad() {
  const [content, setContent] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSavedRef = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data } = useQuery({
    queryKey: ['scratchpad'],
    queryFn: getScratchpad,
  });

  // Load saved content
  useEffect(() => {
    if (data) {
      setContent(data.content);
      lastSavedRef.current = data.content;
    }
  }, [data]);

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // Auto-save with debounce
  const handleChange = useCallback((value: string) => {
    setContent(value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (value === lastSavedRef.current) return;
      lastSavedRef.current = value;
      try {
        await updateScratchpad(value);
      } catch (err) {
        console.error('Scratchpad auto-save failed:', err);
      }
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <Pencil className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-medium text-slate-600 dark:text-slate-300">Scratchpad</h2>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Jot something down..."
        className="flex-1 w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 resize-none focus:outline-none text-sm leading-relaxed"
      />

      {/* Footer */}
      <div className="px-4 py-1 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
        {content.length} characters
      </div>
    </div>
  );
}
