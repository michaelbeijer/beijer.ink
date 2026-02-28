import { useState } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Minus,
  Strikethrough,
  Table,
  HelpCircle,
} from 'lucide-react';
import type { EditorView } from '@codemirror/view';
import { MarkdownCheatSheet } from './MarkdownCheatSheet';

interface MarkdownToolbarProps {
  view: React.RefObject<EditorView | null>;
}

type ToolbarAction = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action: (view: EditorView) => void;
};

function wrapSelection(view: EditorView, before: string, after: string) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  view.dispatch({
    changes: { from, to, insert: `${before}${selected || 'text'}${after}` },
    selection: {
      anchor: from + before.length,
      head: from + before.length + (selected.length || 4),
    },
  });
  view.focus();
}

function insertAtLineStart(view: EditorView, prefix: string) {
  const { from } = view.state.selection.main;
  const line = view.state.doc.lineAt(from);
  view.dispatch({
    changes: { from: line.from, to: line.from, insert: prefix },
    selection: { anchor: line.from + prefix.length },
  });
  view.focus();
}

function insertBlock(view: EditorView, text: string) {
  const { from } = view.state.selection.main;
  view.dispatch({
    changes: { from, insert: text },
    selection: { anchor: from + text.length },
  });
  view.focus();
}

const actions: ToolbarAction[] = [
  {
    icon: Bold,
    title: 'Bold',
    action: (v) => wrapSelection(v, '**', '**'),
  },
  {
    icon: Italic,
    title: 'Italic',
    action: (v) => wrapSelection(v, '*', '*'),
  },
  {
    icon: Strikethrough,
    title: 'Strikethrough',
    action: (v) => wrapSelection(v, '~~', '~~'),
  },
  {
    icon: Heading1,
    title: 'Heading 1',
    action: (v) => insertAtLineStart(v, '# '),
  },
  {
    icon: Heading2,
    title: 'Heading 2',
    action: (v) => insertAtLineStart(v, '## '),
  },
  {
    icon: Heading3,
    title: 'Heading 3',
    action: (v) => insertAtLineStart(v, '### '),
  },
  {
    icon: Code,
    title: 'Inline code',
    action: (v) => wrapSelection(v, '`', '`'),
  },
  {
    icon: Link,
    title: 'Link',
    action: (v) => {
      const { from, to } = v.state.selection.main;
      const selected = v.state.sliceDoc(from, to);
      const text = `[${selected || 'link text'}](url)`;
      v.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + 1, head: from + 1 + (selected.length || 9) },
      });
      v.focus();
    },
  },
  {
    icon: List,
    title: 'Bullet list',
    action: (v) => insertAtLineStart(v, '- '),
  },
  {
    icon: ListOrdered,
    title: 'Ordered list',
    action: (v) => insertAtLineStart(v, '1. '),
  },
  {
    icon: Quote,
    title: 'Quote',
    action: (v) => insertAtLineStart(v, '> '),
  },
  {
    icon: Table,
    title: 'Table',
    action: (v) => insertBlock(v, '\n| Header | Header | Header |\n| ------ | ------ | ------ |\n| Cell   | Cell   | Cell   |\n| Cell   | Cell   | Cell   |\n'),
  },
  {
    icon: Minus,
    title: 'Horizontal rule',
    action: (v) => insertBlock(v, '\n---\n'),
  },
];

export function MarkdownToolbar({ view }: MarkdownToolbarProps) {
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  return (
    <>
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => {
              if (view.current) action.action(view.current);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            title={action.title}
          >
            <action.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={() => setShowCheatSheet(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            title="Markdown cheat sheet"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
      <MarkdownCheatSheet isOpen={showCheatSheet} onClose={() => setShowCheatSheet(false)} />
    </>
  );
}
