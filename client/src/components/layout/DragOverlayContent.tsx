import { FileText } from 'lucide-react';
import type { ActiveDragItem } from '../../hooks/useDndNotebooks';

interface DragOverlayContentProps {
  activeItem: ActiveDragItem;
}

export function DragOverlayContent({ activeItem }: DragOverlayContentProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card border border-edge rounded-lg shadow-xl text-sm text-ink">
      <FileText className="w-4 h-4 shrink-0" />
      <span className="truncate">{activeItem.data.title}</span>
    </div>
  );
}
