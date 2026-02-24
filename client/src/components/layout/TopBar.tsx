import { Search, Menu } from 'lucide-react';

interface TopBarProps {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({ onOpenSearch, onToggleSidebar }: TopBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 lg:hidden">
      <button
        onClick={onToggleSidebar}
        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <button
        onClick={onOpenSearch}
        className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-500"
      >
        <Search className="w-4 h-4" />
        <span>Search notes...</span>
        <kbd className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">Ctrl+K</kbd>
      </button>
    </div>
  );
}
