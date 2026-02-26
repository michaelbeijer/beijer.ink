/** Strip common markdown syntax from a string (for display as plain text). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/, '')                    // heading markers
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')     // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')      // links
    .replace(/(\*\*|__)(.*?)\1/g, '$2')            // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')               // italic
    .replace(/~~(.*?)~~/g, '$1')                   // strikethrough
    .replace(/`([^`]*)`/g, '$1')                   // inline code
    .trim();
}
