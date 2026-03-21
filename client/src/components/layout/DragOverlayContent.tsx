import { FileText, Folder } from 'lucide-react';
import type { ActiveDragItem } from '../../hooks/useDndNotebooks';

interface DragOverlayContentProps {
  activeItem: ActiveDragItem;
}

export function DragOverlayContent({ activeItem }: DragOverlayContentProps) {
  const Icon = activeItem.type === 'notebook' ? Folder : FileText;
  const label = activeItem.type === 'notebook'
    ? (activeItem.data as { name: string }).name
    : (activeItem.data as { title: string }).title;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card border border-edge rounded-lg shadow-xl text-sm text-ink">
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
