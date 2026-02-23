import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getTags, createTag } from '../../api/tags';
import { setNoteTags } from '../../api/notes';
import { TagBadge } from './TagBadge';
import type { Tag } from '../../types/tag';

interface TagPickerProps {
  noteId: string;
  currentTags: Tag[];
}

export function TagPicker({ noteId, currentTags }: TagPickerProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const setTagsMutation = useMutation({
    mutationFn: (tagIds: string[]) => setNoteTags(noteId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      const newTagIds = [...currentTags.map((t) => t.id), newTag.id];
      setTagsMutation.mutate(newTagIds);
      setSearch('');
    },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTagIds = new Set(currentTags.map((t) => t.id));
  const availableTags = allTags.filter(
    (t: Tag) => !currentTagIds.has(t.id) && t.name.toLowerCase().includes(search.toLowerCase())
  );
  const canCreate = search.trim() && !allTags.some((t: Tag) => t.name.toLowerCase() === search.trim().toLowerCase());

  function handleAddTag(tagId: string) {
    const newTagIds = [...currentTags.map((t) => t.id), tagId];
    setTagsMutation.mutate(newTagIds);
    setSearch('');
  }

  function handleRemoveTag(tagId: string) {
    const newTagIds = currentTags.filter((t) => t.id !== tagId).map((t) => t.id);
    setTagsMutation.mutate(newTagIds);
  }

  function handleCreateTag() {
    createTagMutation.mutate({ name: search.trim() });
  }

  return (
    <div className="relative flex items-center gap-1 flex-wrap" ref={dropdownRef}>
      {currentTags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} onRemove={() => handleRemoveTag(tag.id)} />
      ))}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
      >
        <Plus className="w-3 h-3" />
        <span>Tag</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1">
          <div className="px-2 py-1.5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or create tag..."
              className="w-full bg-slate-900 text-white text-sm px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-40 overflow-y-auto">
            {availableTags.map((tag: Tag) => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.id)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: tag.color || '#6b7280' }}
                />
                {tag.name}
              </button>
            ))}

            {canCreate && (
              <button
                onClick={handleCreateTag}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-blue-400 hover:bg-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Create "{search.trim()}"
              </button>
            )}

            {availableTags.length === 0 && !canCreate && (
              <p className="px-3 py-2 text-xs text-slate-500">No tags found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
