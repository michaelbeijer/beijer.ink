import { Search, Menu } from 'lucide-react';

interface TopBarProps {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({ onOpenSearch, onToggleSidebar }: TopBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-panel border-b border-edge lg:hidden">
      <button
        onClick={onToggleSidebar}
        className="p-2 text-ink-muted hover:text-ink hover:bg-hover rounded-md transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <button
        onClick={onOpenSearch}
        className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-muted-bg border border-edge rounded-lg text-sm text-ink-muted"
      >
        <Search className="w-4 h-4" />
        <span>Search notes...</span>
        <kbd className="ml-auto text-xs bg-muted-bg px-1 py-0.5 rounded">Ctrl+K</kbd>
      </button>
    </div>
  );
}
