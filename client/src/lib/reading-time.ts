// Utility function to calculate reading time
export const calculateReadingTime = (content: string): number => {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  // Count words (split by whitespace)
  const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
  // Average reading speed: 200-250 words per minute
  const readingMinutes = Math.ceil(words / 220);
  return Math.max(1, readingMinutes);
};

export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return 'Less than a minute read';
  if (minutes === 1) return '1 minute read';
  return `${minutes} min read`;
};
