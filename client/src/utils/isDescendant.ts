import type { Notebook } from '../types/notebook';

/**
 * Returns true if targetId is a descendant of ancestorId in the notebook tree.
 * Used to prevent circular reparenting (moving a notebook into its own subtree).
 */
export function isDescendant(notebooks: Notebook[], ancestorId: string, targetId: string): boolean {
  let current: string | null = targetId;
  const visited = new Set<string>();
  while (current) {
    if (current === ancestorId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    const nb = notebooks.find((n) => n.id === current);
    current = nb?.parentId ?? null;
  }
  return false;
}
