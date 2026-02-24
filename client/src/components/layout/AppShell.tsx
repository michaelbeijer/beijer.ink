import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { NoteListPanel } from '../notes/NoteListPanel';
import { NoteEditor } from '../editor/NoteEditor';
import { GlobalSearchDialog } from '../search/GlobalSearchDialog';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getNoteById } from '../../api/notes';

type MobileView = 'sidebar' | 'notes' | 'editor';

export function AppShell() {
  const queryClient = useQueryClient();
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('editor');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px)');

  const handleSelectNotebook = useCallback((id: string) => {
    setSelectedNotebookId(id);
    setSelectedNoteId(null);
    setMobileView('notes');
  }, []);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
    setMobileView('editor');
  }, []);

  const handleNoteDeleted = useCallback(() => {
    setSelectedNoteId(null);
    setMobileView('notes');
  }, []);

  const handleSearchSelectNote = useCallback(async (noteId: string) => {
    // Load the note to find its notebook
    const note = await getNoteById(noteId);
    if (note) {
      setSelectedNotebookId(note.notebookId);
      setSelectedNoteId(noteId);
      setMobileView('editor');
    }
  }, []);

  // Ctrl+K global shortcut
  const handleOpenSearch = useCallback(() => {
    setShowSearch(true);
  }, []);

  // Desktop: 3-column layout
  if (isDesktop) {
    return (
      <div className="h-screen flex bg-white dark:bg-slate-950">
        {/* Sidebar */}
        <div className="w-60 shrink-0">
          <Sidebar
            selectedNotebookId={selectedNotebookId}
            onSelectNotebook={handleSelectNotebook}
          />
        </div>

        {/* Note list */}
        <div className="w-72 shrink-0">
          <NoteListPanel
            notebookId={selectedNotebookId}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Desktop search bar */}
          <div className="flex items-center px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={handleOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-500 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search all notes...</span>
              <kbd className="ml-4 text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">Ctrl+K</kbd>
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <NoteEditor noteId={selectedNoteId} onNoteDeleted={handleNoteDeleted} />
          </div>
        </div>

        <GlobalSearchDialog
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectNote={handleSearchSelectNote}
        />
      </div>
    );
  }

  // Mobile / Tablet
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      <TopBar
        onOpenSearch={handleOpenSearch}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 min-h-0 relative">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && !isDesktop && (
          <>
            <div className="absolute inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 z-40">
              <Sidebar
                selectedNotebookId={selectedNotebookId}
                onSelectNotebook={(id) => {
                  handleSelectNotebook(id);
                  setSidebarOpen(false);
                }}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Content */}
        {mobileView === 'sidebar' && (
          <Sidebar
            selectedNotebookId={selectedNotebookId}
            onSelectNotebook={handleSelectNotebook}
          />
        )}

        {mobileView === 'notes' && (
          <NoteListPanel
            notebookId={selectedNotebookId}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
          />
        )}

        {mobileView === 'editor' && (
          <NoteEditor noteId={selectedNoteId} onNoteDeleted={handleNoteDeleted} />
        )}
      </div>

      <MobileNav
        activeView={mobileView}
        onChangeView={setMobileView}
        hasNotebook={!!selectedNotebookId}
        hasNote={!!selectedNoteId}
      />

      <GlobalSearchDialog
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectNote={handleSearchSelectNote}
      />
    </div>
  );
}
