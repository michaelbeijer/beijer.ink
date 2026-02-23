import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PmNode } from '@tiptap/pm/model';

export interface SearchAndReplaceOptions {
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
}

export interface SearchAndReplaceStorage {
  results: { from: number; to: number }[];
  currentIndex: number;
}

const searchPluginKey = new PluginKey('searchAndReplace');

function findMatches(doc: PmNode, searchTerm: string, caseSensitive: boolean) {
  const results: { from: number; to: number }[] = [];
  if (!searchTerm) return results;

  const text = doc.textBetween(0, doc.content.size);
  const search = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  const content = caseSensitive ? text : text.toLowerCase();

  let pos = 0;
  while (pos < content.length) {
    const index = content.indexOf(search, pos);
    if (index === -1) break;
    // +1 offset for ProseMirror document node
    results.push({ from: index + 1, to: index + search.length + 1 });
    pos = index + 1;
  }

  return results;
}

export const SearchAndReplace = Extension.create<SearchAndReplaceOptions, SearchAndReplaceStorage>({
  name: 'searchAndReplace',

  addOptions() {
    return {
      searchTerm: '',
      replaceTerm: '',
      caseSensitive: false,
    };
  },

  addStorage() {
    return {
      results: [] as { from: number; to: number }[],
      currentIndex: 0,
    };
  },

  // Using addCommands with `as any` to avoid complex TipTap generics
  // These commands are called via (editor.commands as any).setSearchTerm(...)
  addCommands() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const ext = this;
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ editor: e }: { editor: any }) => {
          e.extensionStorage.searchAndReplace.currentIndex = 0;
          ext.options.searchTerm = searchTerm;
          e.view.dispatch(e.state.tr);
          return true;
        },
      setReplaceTerm:
        (replaceTerm: string) =>
        () => {
          ext.options.replaceTerm = replaceTerm;
          return true;
        },
      setCaseSensitive:
        (caseSensitive: boolean) =>
        ({ editor: e }: { editor: any }) => {
          ext.options.caseSensitive = caseSensitive;
          e.view.dispatch(e.state.tr);
          return true;
        },
      nextSearchResult:
        () =>
        ({ editor: e }: { editor: any }) => {
          const storage = e.extensionStorage.searchAndReplace;
          if (storage.results.length === 0) return false;
          storage.currentIndex = (storage.currentIndex + 1) % storage.results.length;
          e.view.dispatch(e.state.tr);
          e.commands.scrollIntoView();
          return true;
        },
      previousSearchResult:
        () =>
        ({ editor: e }: { editor: any }) => {
          const storage = e.extensionStorage.searchAndReplace;
          if (storage.results.length === 0) return false;
          storage.currentIndex =
            (storage.currentIndex - 1 + storage.results.length) % storage.results.length;
          e.view.dispatch(e.state.tr);
          return true;
        },
      replaceCurrentResult:
        () =>
        ({ editor: e, commands: cmds }: { editor: any; commands: any }) => {
          const storage = e.extensionStorage.searchAndReplace;
          const result = storage.results[storage.currentIndex];
          if (!result) return false;
          cmds.insertContentAt({ from: result.from, to: result.to }, ext.options.replaceTerm);
          return true;
        },
      replaceAllResults:
        () =>
        ({ editor: e, commands: cmds }: { editor: any; commands: any }) => {
          const storage = e.extensionStorage.searchAndReplace;
          const results = [...storage.results].reverse();
          for (const result of results) {
            cmds.insertContentAt({ from: result.from, to: result.to }, ext.options.replaceTerm);
          }
          return true;
        },
    } as any;
  },

  addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const extensionThis = this;

    return [
      new Plugin({
        key: searchPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr) {
            const { searchTerm, caseSensitive } = extensionThis.options;
            const results = findMatches(tr.doc, searchTerm, caseSensitive);
            extensionThis.storage.results = results;

            if (results.length === 0) return DecorationSet.empty;

            const currentIndex = extensionThis.storage.currentIndex;
            const decorations = results.map((result, index) =>
              Decoration.inline(result.from, result.to, {
                class: index === currentIndex ? 'search-result-current' : 'search-result-highlight',
              })
            );

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
