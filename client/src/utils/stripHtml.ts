export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function getPreview(html: string, maxLength = 120): string {
  const text = stripHtml(html).trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
