import { useRef, useEffect, useCallback } from 'react';
import { EditorView, placeholder as cmPlaceholder, keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { GFM } from '@lezer/markdown';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lightTheme, darkTheme } from '../editor/theme';
import {
  searchHighlightField,
  setSearchEffect,
  clearSearchEffect,
  setCurrentMatchEffect,
  type SearchHighlightState,
} from '../editor/searchHighlight';

interface UseCodeMirrorOptions {
  onChange: (value: string) => void;
  placeholder?: string;
  dark?: boolean;
}

export function useCodeMirror({ onChange, placeholder, dark }: UseCodeMirrorOptions) {
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const suppressRef = useRef(false);
  const themeCompartment = useRef(new Compartment());
  const darkRef = useRef(dark);
  darkRef.current = dark;
  const placeholderRef = useRef(placeholder);
  placeholderRef.current = placeholder;

  // Callback ref: create EditorView when container mounts, destroy when it unmounts.
  // Unlike useEffect(fn, []), this fires reliably when the DOM element appears.
  const containerRef = useCallback((el: HTMLDivElement | null) => {
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    if (!el) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !suppressRef.current) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const extensions = [
      history(),
      closeBrackets(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
      ]),
      markdown({ codeLanguages: languages, extensions: GFM }),
      themeCompartment.current.of(darkRef.current ? darkTheme : lightTheme),
      EditorView.lineWrapping,
      searchHighlightField,
      updateListener,
    ];

    if (placeholderRef.current) {
      extensions.push(cmPlaceholder(placeholderRef.current));
    }

    viewRef.current = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions,
      }),
      parent: el,
    });
  }, []);

  // Switch theme when dark mode changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.current.reconfigure(dark ? darkTheme : lightTheme),
    });
  }, [dark]);

  // Replace entire document (for loading a new note)
  const setDoc = useCallback((value: string) => {
    const view = viewRef.current;
    if (!view) return;
    suppressRef.current = true;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
    suppressRef.current = false;
  }, []);

  // Focus the editor
  const focus = useCallback(() => {
    viewRef.current?.focus();
  }, []);

  // Get current doc length
  const getLength = useCallback(() => {
    return viewRef.current?.state.doc.length ?? 0;
  }, []);

  // ── Search highlighting ──

  const setSearch = useCallback((query: string) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setSearchEffect.of(query) });
  }, []);

  const clearSearch = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: clearSearchEffect.of(undefined) });
  }, []);

  const getSearchState = useCallback((): SearchHighlightState => {
    const view = viewRef.current;
    if (!view) return { query: '', matches: [], currentIndex: -1 };
    return view.state.field(searchHighlightField);
  }, []);

  const goToMatch = useCallback((index: number) => {
    const view = viewRef.current;
    if (!view) return;
    const state = view.state.field(searchHighlightField);
    if (index < 0 || index >= state.matches.length) return;
    view.dispatch({
      effects: setCurrentMatchEffect.of(index),
      scrollIntoView: false,
    });
    // Scroll to the match position
    const match = state.matches[index];
    view.dispatch({
      effects: EditorView.scrollIntoView(match.from, { y: 'center' }),
    });
  }, []);

  const nextMatch = useCallback(() => {
    const state = getSearchState();
    if (state.matches.length === 0) return;
    const next = (state.currentIndex + 1) % state.matches.length;
    goToMatch(next);
  }, [getSearchState, goToMatch]);

  const prevMatch = useCallback(() => {
    const state = getSearchState();
    if (state.matches.length === 0) return;
    const prev = (state.currentIndex - 1 + state.matches.length) % state.matches.length;
    goToMatch(prev);
  }, [getSearchState, goToMatch]);

  return {
    containerRef,
    view: viewRef,
    setDoc,
    focus,
    getLength,
    setSearch,
    clearSearch,
    getSearchState,
    goToMatch,
    nextMatch,
    prevMatch,
  };
}
