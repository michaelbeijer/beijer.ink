import { useEffect } from 'react';
import { X } from 'lucide-react';

interface MarkdownCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: 'Text Formatting',
    rows: [
      ['**bold**', 'Bold text'],
      ['*italic*', 'Italic text'],
      ['~~strikethrough~~', 'Strikethrough'],
      ['`inline code`', 'Inline code'],
      ['[link text](url)', 'Hyperlink'],
    ],
  },
  {
    title: 'Headings',
    rows: [
      ['# Heading 1', 'Largest heading'],
      ['## Heading 2', 'Second heading'],
      ['### Heading 3', 'Third heading'],
    ],
  },
  {
    title: 'Lists',
    rows: [
      ['- item', 'Bullet list'],
      ['1. item', 'Numbered list'],
      ['- [ ] task', 'Task list (unchecked)'],
      ['- [x] task', 'Task list (checked)'],
    ],
  },
  {
    title: 'Blocks',
    rows: [
      ['> quote', 'Blockquote'],
      ['---', 'Horizontal rule'],
      ['```lang\\ncode\\n```', 'Code block'],
    ],
  },
  {
    title: 'Tables',
    rows: [
      ['| H1 | H2 |', 'Table header row'],
      ['| -- | -- |', 'Separator (required)'],
      ['| A  | B  |', 'Table data row'],
    ],
  },
  {
    title: 'Other',
    rows: [
      ['![alt](url)', 'Image'],
      ['\\*escaped\\*', 'Escape special chars'],
    ],
  },
];

export function MarkdownCheatSheet({ isOpen, onClose }: MarkdownCheatSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Markdown Cheat Sheet</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.rows.map(([syntax, desc]) => (
                  <div key={syntax} className="flex items-baseline gap-3">
                    <code className="shrink-0 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono whitespace-pre">
                      {syntax}
                    </code>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
