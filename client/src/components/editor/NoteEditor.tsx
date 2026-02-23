import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Trash2, Pin, PinOff } from 'lucide-react';

import { getNoteById, updateNote, deleteNote } from '../../api/notes';
import { uploadImage } from '../../api/images';
import { useAutoSave } from '../../hooks/useAutoSave';
import { EditorToolbar } from './EditorToolbar';
import { TableMenu } from './TableMenu';
import { SearchBar } from './SearchBar';
import { ResizableImage } from './extensions/resizable-image';
import { SearchAndReplace } from './extensions/search-and-replace';
import { TagPicker } from '../tags/TagPicker';

interface NoteEditorProps {
  noteId: string | null;
  onNoteDeleted?: () => void;
}

export function NoteEditor({ noteId, onNoteDeleted }: NoteEditorProps) {
  const queryClient = useQueryClient();
  const [showSearch, setShowSearch] = useState(false);
  const [title, setTitle] = useState('');
  const { save, saveNow } = useAutoSave(noteId);

  const { data: note } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNoteById(noteId!),
    enabled: !!noteId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      onNoteDeleted?.();
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      updateNote(id, { isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true, lastColumnResizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Typography,
      CharacterCount,
      Color,
      TextStyle,
      Subscript,
      Superscript,
      SearchAndReplace,
      ResizableImage,
    ],
    content: '',
    onUpdate: ({ editor: e }) => {
      save(e.getHTML(), title);
    },
    editorProps: {
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;

        const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (!imageFiles.length) return false;

        event.preventDefault();

        for (const file of imageFiles) {
          uploadImage(file).then((img) => {
            const { schema } = view.state;
            const node = schema.nodes.resizableImage.create({
              src: img.url,
              width: img.width,
              height: img.height,
            });
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (pos) {
              const tr = view.state.tr.insert(pos.pos, node);
              view.dispatch(tr);
            }
          });
        }

        return true;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const imageItems = Array.from(items).filter((item) => item.type.startsWith('image/'));
        if (!imageItems.length) return false;

        event.preventDefault();

        for (const item of imageItems) {
          const file = item.getAsFile();
          if (!file) continue;
          uploadImage(file).then((img) => {
            const { schema } = view.state;
            const node = schema.nodes.resizableImage.create({
              src: img.url,
              width: img.width,
              height: img.height,
            });
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
          });
        }

        return true;
      },
    },
  });

  // Load note content into editor
  useEffect(() => {
    if (note && editor) {
      setTitle(note.title);
      editor.commands.setContent(note.content || '');
    }
  }, [note, editor]);

  // Ctrl+F shortcut
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      if (noteId && editor) {
        save(editor.getHTML(), newTitle);
      }
    },
    [noteId, editor, save]
  );

  const handleTitleBlur = useCallback(async () => {
    if (noteId && editor) {
      await saveNow(editor.getHTML(), title);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  }, [noteId, editor, title, saveNow, queryClient]);

  if (!noteId) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <p className="text-slate-500">Select or create a note to start writing</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Title + actions */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Note title..."
          className="flex-1 bg-transparent text-xl font-semibold text-white placeholder-slate-600 focus:outline-none"
        />
        <button
          onClick={() => {
            if (noteId && note) {
              pinMutation.mutate({ id: noteId, isPinned: !note.isPinned });
            }
          }}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title={note?.isPinned ? 'Unpin' : 'Pin'}
        >
          {note?.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
        <button
          onClick={() => {
            if (noteId && confirm('Delete this note?')) {
              deleteMutation.mutate(noteId);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tags */}
      {noteId && (
        <div className="px-4 py-1.5 border-b border-slate-800/50">
          <TagPicker
            noteId={noteId}
            currentTags={note?.tags?.map((nt) => nt.tag) || []}
          />
        </div>
      )}

      {/* Toolbar */}
      <EditorToolbar editor={editor} onToggleSearch={() => setShowSearch(!showSearch)} />

      {/* Search bar */}
      {showSearch && editor && (
        <SearchBar editor={editor} onClose={() => setShowSearch(false)} />
      )}

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto">
        {editor && <TableMenu editor={editor} />}
        <EditorContent editor={editor} className="tiptap prose prose-invert max-w-none" />
      </div>

      {/* Status bar */}
      {editor && (
        <div className="flex items-center justify-between px-4 py-1 border-t border-slate-800 text-xs text-slate-600">
          <span>{editor.storage.characterCount?.characters()} characters</span>
          <span>{editor.storage.characterCount?.words()} words</span>
        </div>
      )}
    </div>
  );
}
