/**
 * Sanitize HTML content by removing markdown symbols and cleaning up HTML tags
 * Removes: <strong> tags, #/##/### markdown headers, and extra whitespace
 */
export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') return '';

  let cleaned = content;

  // Remove <strong> and </strong> tags
  cleaned = cleaned.replace(/<\/?strong>/g, '');

  // Remove markdown heading symbols at line starts (# ## ###)
  cleaned = cleaned.replace(/^#+\s+/gm, '');

  // Convert markdown headers to semantic HTML (but keep them rendered)
  // This allows proper rendering while removing the # symbols
  cleaned = cleaned.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  cleaned = cleaned.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  cleaned = cleaned.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Remove extra blank lines
  cleaned = cleaned.replace(/\n\n+/g, '\n\n');

  return cleaned.trim();
}

/**
 * Extract plain text from HTML content (for previews/excerpts)
 */
export function extractPlainText(content: string): string {
  if (!content || typeof content !== 'string') return '';

  let text = content;

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Remove markdown symbols
  text = text.replace(/^#+\s+/gm, '');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}
