import { Folder, Edit3 } from 'lucide-react';

type MobileView = 'sidebar' | 'editor';

interface MobileNavProps {
  activeView: MobileView;
  onChangeView: (view: MobileView) => void;
  hasNote: boolean;
}

export function MobileNav({ activeView, onChangeView, hasNote }: MobileNavProps) {
  return (
    <div className="flex items-center justify-around bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 lg:hidden">
      <button
        onClick={() => onChangeView('sidebar')}
        className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
          activeView === 'sidebar' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <Folder className="w-5 h-5" />
        <span className="text-[10px]">Notebooks</span>
      </button>

      <button
        onClick={() => onChangeView('editor')}
        className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
          activeView === 'editor' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
        }`}
      >
        <Edit3 className="w-5 h-5" />
        <span className="text-[10px]">{hasNote ? 'Editor' : 'Scratchpad'}</span>
      </button>
    </div>
  );
}
