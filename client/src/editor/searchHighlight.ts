import { StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { SearchCursor } from '@codemirror/search';

// ── Effects ──

export const setSearchEffect = StateEffect.define<string>();
export const clearSearchEffect = StateEffect.define<void>();
export const setCurrentMatchEffect = StateEffect.define<number>();

// ── State ──

export interface SearchHighlightState {
  query: string;
  matches: { from: number; to: number }[];
  currentIndex: number;
}

const emptyState: SearchHighlightState = { query: '', matches: [], currentIndex: -1 };

const matchMark = Decoration.mark({ class: 'cm-search-match' });
const activeMark = Decoration.mark({ class: 'cm-search-match-active' });

export const searchHighlightField = StateField.define<SearchHighlightState>({
  create() {
    return emptyState;
  },

  update(state, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSearchEffect)) {
        const query = effect.value;
        if (!query) return emptyState;

        const matches: { from: number; to: number }[] = [];
        const cursor = new SearchCursor(tr.state.doc, query.toLowerCase(), 0, tr.state.doc.length, (s) =>
          s.toLowerCase()
        );
        while (!cursor.next().done) {
          matches.push({ from: cursor.value.from, to: cursor.value.to });
        }

        return { query, matches, currentIndex: matches.length > 0 ? 0 : -1 };
      }

      if (effect.is(clearSearchEffect)) {
        return emptyState;
      }

      if (effect.is(setCurrentMatchEffect)) {
        return { ...state, currentIndex: effect.value };
      }
    }

    // If the document changed (user typing), clear the search
    if (tr.docChanged && state.query) {
      return emptyState;
    }

    return state;
  },

  provide(field) {
    return EditorView.decorations.from(field, (state) => {
      if (state.matches.length === 0) return Decoration.none;

      const builder = new RangeSetBuilder<Decoration>();

      // Decorations must be added in document order
      for (let i = 0; i < state.matches.length; i++) {
        const m = state.matches[i];
        builder.add(m.from, m.to, i === state.currentIndex ? activeMark : matchMark);
      }

      return builder.finish();
    });
  },
});
