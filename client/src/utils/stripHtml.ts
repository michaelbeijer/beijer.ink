export function getPreview(text: string, maxLength = 120): string {
  // Skip the first line (it's the title) and use the rest for preview
  const lines = text.split('\n');
  const body = lines.slice(1).join('\n').trim();
  if (!body) return '';
  if (body.length <= maxLength) return body;
  return body.slice(0, maxLength) + '...';
}
