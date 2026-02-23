import { X } from 'lucide-react';
import type { Tag } from '../../types/tag';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${tag.color || '#6b7280'}20`,
        color: tag.color || '#6b7280',
        border: `1px solid ${tag.color || '#6b7280'}40`,
      }}
    >
      {tag.name}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
