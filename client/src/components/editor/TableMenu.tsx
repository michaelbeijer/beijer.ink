import { BubbleMenu, type Editor } from '@tiptap/react';
import {
  Plus,
  Minus,
  Trash2,
  Rows3,
  Columns3,
  TableCellsMerge,
  TableCellsSplit,
} from 'lucide-react';

interface TableMenuProps {
  editor: Editor;
}

function MenuButton({
  onClick,
  title,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded text-xs transition-colors ${
        variant === 'danger'
          ? 'text-red-400 hover:bg-red-500/20'
          : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

export function TableMenu({ editor }: TableMenuProps) {
  const iconSize = 'w-3.5 h-3.5';

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: 'top' }}
      shouldShow={({ editor: e }) => e.isActive('table')}
      className="flex items-center gap-0.5 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-1"
    >
      <MenuButton
        onClick={() => editor.chain().focus().addRowBefore().run()}
        title="Add row above"
      >
        <div className="flex items-center gap-0.5">
          <Plus className={iconSize} />
          <Rows3 className={iconSize} />
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().addRowAfter().run()}
        title="Add row below"
      >
        <div className="flex items-center gap-0.5">
          <Rows3 className={iconSize} />
          <Plus className={iconSize} />
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().deleteRow().run()}
        title="Delete row"
      >
        <div className="flex items-center gap-0.5">
          <Minus className={iconSize} />
          <Rows3 className={iconSize} />
        </div>
      </MenuButton>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      <MenuButton
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        title="Add column before"
      >
        <div className="flex items-center gap-0.5">
          <Plus className={iconSize} />
          <Columns3 className={iconSize} />
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        title="Add column after"
      >
        <div className="flex items-center gap-0.5">
          <Columns3 className={iconSize} />
          <Plus className={iconSize} />
        </div>
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().deleteColumn().run()}
        title="Delete column"
      >
        <div className="flex items-center gap-0.5">
          <Minus className={iconSize} />
          <Columns3 className={iconSize} />
        </div>
      </MenuButton>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      <MenuButton
        onClick={() => editor.chain().focus().mergeCells().run()}
        title="Merge cells"
      >
        <TableCellsMerge className={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().splitCell().run()}
        title="Split cell"
      >
        <TableCellsSplit className={iconSize} />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        title="Toggle header row"
      >
        <span className="text-[10px] font-bold">H</span>
      </MenuButton>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      <MenuButton
        onClick={() => editor.chain().focus().deleteTable().run()}
        title="Delete table"
        variant="danger"
      >
        <Trash2 className={iconSize} />
      </MenuButton>
    </BubbleMenu>
  );
}
