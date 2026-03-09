import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';
import type { Theme } from '../contexts/ThemeContext';

/**
 * Markdown syntax highlighting — styles content inline while keeping markup visible.
 * Uses a factory function so each theme gets its own color set.
 */

interface ThemeColors {
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  heading5: string;
  heading6: string;
  strong: string;
  strikethrough: string;
  monoBg: string;
  link: string;
  quote: string;
  list: string;
  markup: string;
  label: string;
  separator: string;
  comment: string;
  content: string;
}

const themeColors: Record<Theme, ThemeColors> = {
  light: {
    heading1: '#0f172a', heading2: '#0f172a', heading3: '#1e293b',
    heading4: '#1e293b', heading5: '#334155', heading6: '#475569',
    strong: '#0f172a', strikethrough: '#94a3b8', monoBg: '#f1f5f9',
    link: '#2563eb', quote: '#64748b', list: '#475569',
    markup: '#cbd5e1', label: '#64748b', separator: '#cbd5e1',
    comment: '#94a3b8', content: '#0f172a',
  },
  dark: {
    heading1: '#f1f5f9', heading2: '#f1f5f9', heading3: '#e2e8f0',
    heading4: '#e2e8f0', heading5: '#cbd5e1', heading6: '#94a3b8',
    strong: '#f1f5f9', strikethrough: '#64748b', monoBg: '#1e293b',
    link: '#60a5fa', quote: '#94a3b8', list: '#94a3b8',
    markup: '#475569', label: '#94a3b8', separator: '#475569',
    comment: '#64748b', content: '#e2e8f0',
  },
  rose: {
    heading1: '#3d2e22', heading2: '#3d2e22', heading3: '#5a4435',
    heading4: '#5a4435', heading5: '#7d6555', heading6: '#9a8070',
    strong: '#3d2e22', strikethrough: '#bfa892', monoBg: '#f3e4d5',
    link: '#c2705a', quote: '#9a8070', list: '#7d6555',
    markup: '#d8c5b0', label: '#9a8070', separator: '#d8c5b0',
    comment: '#bfa892', content: '#3d2e22',
  },
  lavender: {
    heading1: '#1e1832', heading2: '#1e1832', heading3: '#3a3050',
    heading4: '#3a3050', heading5: '#5a5070', heading6: '#7a7090',
    strong: '#1e1832', strikethrough: '#9e96b0', monoBg: '#e5dff0',
    link: '#7c5cbf', quote: '#7a7090', list: '#5a5070',
    markup: '#c2bcd0', label: '#7a7090', separator: '#c2bcd0',
    comment: '#9e96b0', content: '#1e1832',
  },
  mint: {
    heading1: '#1a2e22', heading2: '#1a2e22', heading3: '#2d4a38',
    heading4: '#2d4a38', heading5: '#4a6d58', heading6: '#5f8570',
    strong: '#1a2e22', strikethrough: '#8aab98', monoBg: '#d5e8dd',
    link: '#2d8a5e', quote: '#5f8570', list: '#4a6d58',
    markup: '#afc8ba', label: '#5f8570', separator: '#afc8ba',
    comment: '#8aab98', content: '#1a2e22',
  },
};

function createHighlightStyle(c: ThemeColors) {
  return HighlightStyle.define([
    { tag: tags.heading1, fontWeight: '700', fontSize: '1.5em', color: c.heading1 },
    { tag: tags.heading2, fontWeight: '700', fontSize: '1.3em', color: c.heading2 },
    { tag: tags.heading3, fontWeight: '600', fontSize: '1.15em', color: c.heading3 },
    { tag: tags.heading4, fontWeight: '600', fontSize: '1.05em', color: c.heading4 },
    { tag: tags.heading5, fontWeight: '600', color: c.heading5 },
    { tag: tags.heading6, fontWeight: '600', color: c.heading6 },
    { tag: tags.strong, fontWeight: 'bold', color: c.strong },
    { tag: tags.emphasis, fontStyle: 'italic' },
    { tag: tags.strikethrough, textDecoration: 'line-through', color: c.strikethrough },
    { tag: tags.monospace, fontFamily: 'inherit', backgroundColor: c.monoBg, borderRadius: '3px', padding: '1px 4px' },
    { tag: tags.link, color: c.link, textDecoration: 'underline' },
    { tag: tags.url, color: c.link },
    { tag: tags.quote, color: c.quote, fontStyle: 'italic' },
    { tag: tags.list, color: c.list },
    { tag: tags.processingInstruction, color: c.markup },
    { tag: tags.labelName, color: c.label },
    { tag: tags.string, color: c.label },
    { tag: tags.contentSeparator, color: c.separator },
    { tag: tags.comment, color: c.comment },
    { tag: tags.content, color: c.content },
  ]);
}

const editorThemes: Record<Theme, Extension[]> = Object.fromEntries(
  Object.entries(themeColors).map(([key, colors]) => [
    key,
    [syntaxHighlighting(createHighlightStyle(colors))],
  ])
) as Record<Theme, Extension[]>;

export function getEditorTheme(theme: Theme): Extension[] {
  return editorThemes[theme];
}
