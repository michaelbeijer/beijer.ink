import { useRef, useEffect, useCallback } from 'react';
import { EditorView, placeholder as cmPlaceholder, keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lightTheme, darkTheme } from '../editor/theme';

interface UseCodeMirrorOptions {
  onChange: (value: string) => void;
  placeholder?: string;
  dark?: boolean;
}

export function useCodeMirror({ onChange, placeholder, dark }: UseCodeMirrorOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const suppressRef = useRef(false);
  const themeCompartment = useRef(new Compartment());

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !suppressRef.current) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const extensions = [
      // Core editing
      history(),
      closeBrackets(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
      ]),
      // Markdown
      markdown({ codeLanguages: languages }),
      // Theme (in compartment for dynamic switching)
      themeCompartment.current.of(dark ? darkTheme : lightTheme),
      // Behavior
      EditorView.lineWrapping,
      updateListener,
    ];

    if (placeholder) {
      extensions.push(cmPlaceholder(placeholder));
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions,
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount — dark/placeholder changes handled separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return {
    containerRef,
    view: viewRef,
    setDoc,
    focus,
    getLength,
  };
}
