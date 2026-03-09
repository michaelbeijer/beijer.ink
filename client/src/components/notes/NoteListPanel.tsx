import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDraggable } from '@dnd-kit/core';
import { Plus, FileText } from 'lucide-react';
import { getNotesByNotebook, createNote } from '../../api/notes';
import { getPreview } from '../../utils/stripHtml';
import { useListKeyboardNav } from '../../hooks/useListKeyboardNav';
import type { NoteSummary } from '../../types/note';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface DraggableNoteItemProps {
  note: NoteSummary;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: (id: string) => void;
}

function DraggableNoteItem({ note, isSelected, isFocused, onSelect }: DraggableNoteItemProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
  } = useDraggable({
    id: `note-${note.id}`,
    data: { type: 'note', item: note },
  });

  return (
    <div
      ref={setNodeRef}
      id={`listitem-${note.id}`}
      {...attributes}
      {...listeners}
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(note.id)}
      className={`w-full text-left px-4 py-3 border-b border-edge-soft transition-colors cursor-pointer focus:outline-none ${
        isSelected
          ? 'bg-accent/10 border-l-2 border-l-accent'
          : 'hover:bg-hover'
      } ${isFocused ? 'outline outline-2 outline-accent outline-offset-[-2px]' : ''} ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <FileText className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-ink truncate">{note.title}</h3>
          <p className="text-xs text-ink-muted mt-1 line-clamp-2">
            {getPreview(note.content, 100) || 'Empty note'}
          </p>
          <span className="text-xs text-ink-dim mt-1 block">{formatDate(note.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

interface NoteListPanelProps {
  notebookId: string | null;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

export function NoteListPanel({ notebookId, selectedNoteId, onSelectNote }: NoteListPanelProps) {
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', notebookId],
    queryFn: () => getNotesByNotebook(notebookId!),
    enabled: !!notebookId,
  });

  const { focusedId, setFocusedId, handleKeyDown, handleFocus, handleBlur } = useListKeyboardNav({
    items: notes,
    onSelect: onSelectNote,
    selectedId: selectedNoteId,
  });

  const [creating, setCreating] = useState(false);

  function handleCreate() {
    if (!notebookId || creating) return;
    setCreating(true);
    const nbId = notebookId;

    // Cancel any in-flight refetches so they don't overwrite our optimistic update
    queryClient.cancelQueries({ queryKey: ['notes', nbId] });

    // Optimistic: add placeholder to the list immediately
    const tempId = 'temp-' + Date.now();
    queryClient.setQueryData<NoteSummary[]>(
      ['notes', nbId],
      (old) => [{
        id: tempId,
        title: 'Untitled',
        content: '',
        isPinned: false,
        sortOrder: 0,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }, ...(old || [])]
    );

    // Then create on the server and swap temp for real note
    createNote({ notebookId: nbId })
      .then((note) => {
        queryClient.setQueryData<NoteSummary[]>(
          ['notes', nbId],
          (old) => (old || []).map((n) =>
            n.id === tempId ? (note as unknown as NoteSummary) : n
          )
        );
        queryClient.invalidateQueries({ queryKey: ['notebooks'] });
        onSelectNote(note.id);
      })
      .catch(() => {
        queryClient.invalidateQueries({ queryKey: ['notes', nbId] });
      })
      .finally(() => setCreating(false));
  }

  if (!notebookId) {
    return (
      <div className="h-full flex items-center justify-center bg-surface border-r border-edge">
        <p className="text-ink-muted text-sm">Select a notebook</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface border-r border-edge">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
        <span className="text-sm font-medium text-ink-secondary">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleCreate}
          className="p-1.5 text-ink-muted hover:text-ink hover:bg-hover rounded-md transition-colors"
          title="New note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Note list */}
      <div
        className="flex-1 overflow-y-auto"
        role="listbox"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {notes.map((note: NoteSummary) => (
          <DraggableNoteItem
            key={note.id}
            note={note}
            isSelected={note.id === selectedNoteId}
            isFocused={note.id === focusedId}
            onSelect={(id: string) => { onSelectNote(id); setFocusedId(id); }}
          />
        ))}

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-ink-muted">
            <FileText className="w-8 h-8 mb-2" />
            <p className="text-sm">No notes yet</p>
            <button onClick={handleCreate} className="text-accent text-sm hover:underline mt-1">
              Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
