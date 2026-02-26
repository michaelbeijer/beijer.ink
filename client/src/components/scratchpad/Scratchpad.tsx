import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { getScratchpad, updateScratchpad } from '../../api/scratchpad';
import { useCodeMirror } from '../../hooks/useCodeMirror';
import { useTheme } from '../../contexts/ThemeContext';

export function Scratchpad() {
  const { theme } = useTheme();
  const [charCount, setCharCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSavedRef = useRef<string>('');

  const handleChange = useCallback((value: string) => {
    setCharCount(value.length);

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

  const { containerRef, setDoc, focus } = useCodeMirror({
    onChange: handleChange,
    placeholder: 'Jot something down...',
    dark: theme === 'dark',
  });

  const { data } = useQuery({
    queryKey: ['scratchpad'],
    queryFn: getScratchpad,
  });

  // Load saved content
  useEffect(() => {
    if (data) {
      setDoc(data.content);
      setCharCount(data.content.length);
      lastSavedRef.current = data.content;
    }
  }, [data, setDoc]);

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => focus(), 50);
  }, [focus]);

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

      {/* CodeMirror editor */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-hidden" />

      {/* Footer */}
      <div className="px-4 py-1 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
        {charCount} characters
      </div>
    </div>
  );
}
