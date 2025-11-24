/**
 * Advanced Content Sanitization - Expert Level
 * Removes ALL HTML tags, markdown symbols, and returns clean plain text
 */

export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') return '';

  let cleaned = content;

  // Step 1: Decode HTML entities first
  cleaned = decodeHTMLEntities(cleaned);

  // Step 2: Remove ALL HTML tags (including <strong>, <em>, <p>, etc.)
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // Step 3: Remove HTML entity encodings
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  // Step 4: Remove markdown heading symbols at start of lines
  cleaned = cleaned.replace(/^#+\s+/gm, '');

  // Step 5: Remove other markdown symbols
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1'); // **bold**
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1'); // *italic*
  cleaned = cleaned.replace(/__(.+?)__/g, '$1'); // __bold__
  cleaned = cleaned.replace(/_(.+?)_/g, '$1'); // _italic_
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1'); // ~~strikethrough~~
  cleaned = cleaned.replace(/`(.+?)`/g, '$1'); // `code`

  // Step 6: Clean up multiple spaces and empty lines
  cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single
  cleaned = cleaned.replace(/\n\s*\n/g, '\n'); // Multiple newlines to single
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Decode HTML entities in text
 */
function decodeHTMLEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  return decoded;
}

/**
 * Extract plain text from HTML content for previews/excerpts
 * Keeps content readable without HTML formatting
 */
export function extractPlainText(content: string): string {
  return sanitizeContent(content);
}

/**
 * Format content for display - converts to readable paragraphs
 * Removes all markup and displays as clean text
 */
export function formatContentForDisplay(content: string): string {
  const cleaned = sanitizeContent(content);

  // Split into paragraphs on double newlines or common paragraph breaks
  const paragraphs = cleaned
    .split(/\n{2,}|(?:^|\n)(?:##|###|\*\*|--)/m)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs.join('\n\n');
}

/**
 * Sanitize for safe HTML display (removes dangerous content)
 * Returns text formatted for readable display
 */
export function sanitizeForDisplay(content: string): string {
  const cleaned = sanitizeContent(content);

  // Preserve paragraph structure
  const lines = cleaned.split('\n');
  const formatted = lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  return formatted;
}
