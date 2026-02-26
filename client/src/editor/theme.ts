import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/**
 * Markdown syntax highlighting — styles content inline while keeping markup visible.
 * Markup characters (**, ##, `, etc.) are dimmed via processingInstruction tag.
 *
 * Base editor styles (font, padding, colors) are in index.css using Tailwind's
 * .dark class, which avoids CodeMirror's .cm-light/.cm-dark scoping issues.
 */
const lightHighlight = HighlightStyle.define([
  // Headings — progressively smaller
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.5em', color: '#0f172a' },
  { tag: tags.heading2, fontWeight: '700', fontSize: '1.3em', color: '#0f172a' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '1.15em', color: '#1e293b' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1.05em', color: '#1e293b' },
  { tag: tags.heading5, fontWeight: '600', color: '#334155' },
  { tag: tags.heading6, fontWeight: '600', color: '#475569' },
  // Inline formatting
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#94a3b8' },
  // Code
  { tag: tags.monospace, fontFamily: 'inherit', backgroundColor: '#f1f5f9', borderRadius: '3px', padding: '1px 4px' },
  // Links
  { tag: tags.link, color: '#2563eb', textDecoration: 'underline' },
  { tag: tags.url, color: '#2563eb' },
  // Quotes
  { tag: tags.quote, color: '#64748b', fontStyle: 'italic' },
  // Lists
  { tag: tags.list, color: '#475569' },
  // Markup characters (##, **, `, etc.) — dimmed
  { tag: tags.processingInstruction, color: '#cbd5e1' },
  // Label/info
  { tag: tags.labelName, color: '#64748b' },
  { tag: tags.string, color: '#64748b' },
  // Separator
  { tag: tags.contentSeparator, color: '#cbd5e1' },
  // Comment
  { tag: tags.comment, color: '#94a3b8' },
  // Content (default)
  { tag: tags.content, color: '#0f172a' },
]);

const darkHighlight = HighlightStyle.define([
  // Headings
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.5em', color: '#f1f5f9' },
  { tag: tags.heading2, fontWeight: '700', fontSize: '1.3em', color: '#f1f5f9' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '1.15em', color: '#e2e8f0' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1.05em', color: '#e2e8f0' },
  { tag: tags.heading5, fontWeight: '600', color: '#cbd5e1' },
  { tag: tags.heading6, fontWeight: '600', color: '#94a3b8' },
  // Inline formatting
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#64748b' },
  // Code
  { tag: tags.monospace, fontFamily: 'inherit', backgroundColor: '#1e293b', borderRadius: '3px', padding: '1px 4px' },
  // Links
  { tag: tags.link, color: '#60a5fa', textDecoration: 'underline' },
  { tag: tags.url, color: '#60a5fa' },
  // Quotes
  { tag: tags.quote, color: '#94a3b8', fontStyle: 'italic' },
  // Lists
  { tag: tags.list, color: '#94a3b8' },
  // Markup characters — dimmed
  { tag: tags.processingInstruction, color: '#475569' },
  // Label/info
  { tag: tags.labelName, color: '#94a3b8' },
  { tag: tags.string, color: '#94a3b8' },
  // Separator
  { tag: tags.contentSeparator, color: '#475569' },
  // Comment
  { tag: tags.comment, color: '#64748b' },
  // Content
  { tag: tags.content, color: '#e2e8f0' },
]);

/** Light mode extensions (syntax highlighting only) */
export const lightTheme = [syntaxHighlighting(lightHighlight)];

/** Dark mode extensions (syntax highlighting only) */
export const darkTheme = [syntaxHighlighting(darkHighlight)];
