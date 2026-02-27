import type { Notebook } from '../types/notebook';
import type { NoteSummary } from '../types/note';

export interface FlatNotebookNode {
  type: 'notebook';
  id: string;
  notebook: Notebook;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  parentId: string | null;
}

export interface FlatNoteNode {
  type: 'note';
  id: string;
  noteId: string;
  note: NoteSummary;
  depth: number;
  notebookId: string;
  hasChildren: false;
  isExpanded: false;
  parentId: string;
}

export type FlatTreeNode = FlatNotebookNode | FlatNoteNode;

export function flattenNotebookTree(
  notebooks: Notebook[],
  expandedIds: Set<string>,
  notesMap: Map<string, NoteSummary[]> = new Map(),
  parentId: string | null = null,
  depth = 0
): FlatTreeNode[] {
  const children = notebooks
    .filter((nb) => nb.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const result: FlatTreeNode[] = [];
  for (const nb of children) {
    const nodeChildren = notebooks.filter((c) => c.parentId === nb.id);
    const notes = notesMap.get(nb.id) || [];
    const hasChildren = nodeChildren.length > 0 || notes.length > 0;
    const isExpanded = expandedIds.has(nb.id);
    result.push({ type: 'notebook', id: nb.id, notebook: nb, depth, hasChildren, isExpanded, parentId });
    if (isExpanded) {
      // Child notebooks first
      if (nodeChildren.length > 0) {
        result.push(...flattenNotebookTree(notebooks, expandedIds, notesMap, nb.id, depth + 1));
      }
      // Then notes
      for (const note of notes) {
        result.push({
          type: 'note',
          id: `note-${note.id}`,
          noteId: note.id,
          note,
          depth: depth + 1,
          notebookId: nb.id,
          hasChildren: false,
          isExpanded: false,
          parentId: nb.id,
        });
      }
    }
  }
  return result;
}
