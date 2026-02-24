import type { Notebook } from '../types/notebook';

export interface FlatTreeNode {
  id: string;
  notebook: Notebook;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  parentId: string | null;
}

export function flattenNotebookTree(
  notebooks: Notebook[],
  expandedIds: Set<string>,
  parentId: string | null = null,
  depth = 0
): FlatTreeNode[] {
  const children = notebooks
    .filter((nb) => nb.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const result: FlatTreeNode[] = [];
  for (const nb of children) {
    const nodeChildren = notebooks.filter((c) => c.parentId === nb.id);
    const hasChildren = nodeChildren.length > 0;
    const isExpanded = expandedIds.has(nb.id);
    result.push({ id: nb.id, notebook: nb, depth, hasChildren, isExpanded, parentId });
    if (hasChildren && isExpanded) {
      result.push(...flattenNotebookTree(notebooks, expandedIds, nb.id, depth + 1));
    }
  }
  return result;
}
