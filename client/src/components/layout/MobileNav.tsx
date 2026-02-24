import { Folder, FileText, Edit3 } from 'lucide-react';

type MobileView = 'sidebar' | 'notes' | 'editor';

interface MobileNavProps {
  activeView: MobileView;
  onChangeView: (view: MobileView) => void;
  hasNotebook: boolean;
  hasNote: boolean;
}

export function MobileNav({ activeView, onChangeView, hasNotebook, hasNote }: MobileNavProps) {
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
        onClick={() => onChangeView('notes')}
        disabled={!hasNotebook}
        className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
          activeView === 'notes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
        } disabled:opacity-30`}
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px]">Notes</span>
      </button>

      <button
        onClick={() => onChangeView('editor')}
        disabled={!hasNote}
        className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
          activeView === 'editor' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
        } disabled:opacity-30`}
      >
        <Edit3 className="w-5 h-5" />
        <span className="text-[10px]">Editor</span>
      </button>
    </div>
  );
}
