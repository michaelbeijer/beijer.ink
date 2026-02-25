import { FileText } from 'lucide-react';
import type { ActiveDragItem } from '../../hooks/useDndNotebooks';

interface DragOverlayContentProps {
  activeItem: ActiveDragItem;
}

export function DragOverlayContent({ activeItem }: DragOverlayContentProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl text-sm text-slate-700 dark:text-slate-200">
      <FileText className="w-4 h-4 shrink-0" />
      <span className="truncate">{activeItem.data.title}</span>
    </div>
  );
}
