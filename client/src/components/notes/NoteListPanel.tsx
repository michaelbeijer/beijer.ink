import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText } from 'lucide-react';
import { getNotesByNotebook, createNote } from '../../api/notes';
import { getPreview } from '../../utils/stripHtml';
import type { NoteSummary } from '../../types/note';

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

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] });
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      onSelectNote(note.id);
    },
  });

  function handleCreate() {
    if (!notebookId) return;
    createMutation.mutate({ notebookId });
  }

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

  if (!notebookId) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 text-sm">Select a notebook</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={handleCreate}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
          title="New note"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto">
        {notes.map((note: NoteSummary) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 transition-colors ${
              note.id === selectedNoteId
                ? 'bg-blue-50 dark:bg-blue-600/10 border-l-2 border-l-blue-500'
                : 'hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{note.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {getPreview(note.plainText, 100) || 'Empty note'}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-400 dark:text-slate-600">{formatDate(note.updatedAt)}</span>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((nt) => (
                        <span
                          key={nt.tagId}
                          className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        >
                          {nt.tag.name}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-slate-400 dark:text-slate-600">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <FileText className="w-8 h-8 mb-2" />
            <p className="text-sm">No notes yet</p>
            <button onClick={handleCreate} className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1">
              Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
