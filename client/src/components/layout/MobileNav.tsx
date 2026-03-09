import { Folder, Edit3 } from 'lucide-react';

type MobileView = 'sidebar' | 'editor';

interface MobileNavProps {
  activeView: MobileView;
  onChangeView: (view: MobileView) => void;
  hasNote: boolean;
}

export function MobileNav({ activeView, onChangeView, hasNote }: MobileNavProps) {
  return (
    <div className="flex items-center justify-around bg-panel border-t border-edge py-2 lg:hidden">
      <button
        onClick={() => onChangeView('sidebar')}
        className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
          activeView === 'sidebar' ? 'text-accent' : 'text-ink-faint'
        }`}
      >
        <Folder className="w-5 h-5" />
        <span className="text-[10px]">Notebooks</span>
      </button>

      <button
        onClick={() => onChangeView('editor')}
        className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
          activeView === 'editor' ? 'text-accent' : 'text-ink-faint'
        }`}
      >
        <Edit3 className="w-5 h-5" />
        <span className="text-[10px]">{hasNote ? 'Editor' : 'Scratchpad'}</span>
      </button>
    </div>
  );
}
