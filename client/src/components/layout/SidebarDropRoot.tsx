import { useDroppable } from '@dnd-kit/core';

export function SidebarDropRoot() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root-drop-zone',
    data: { type: 'root' },
  });

  return (
    <div
      ref={setNodeRef}
      className={`mx-2 my-1 h-8 rounded-md border-2 border-dashed transition-colors flex items-center justify-center ${
        isOver
          ? 'border-blue-500 bg-blue-600/10 text-blue-500'
          : 'border-slate-300 dark:border-slate-700 text-slate-400'
      }`}
    >
      <span className="text-xs">Drop here for root level</span>
    </div>
  );
}
