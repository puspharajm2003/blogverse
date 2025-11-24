export interface PlagiarismResult {
  overallScore: number; // 0-100 percentage
  matches: PlagiarismMatch[];
  status: "completed" | "pending" | "error";
  error?: string;
}

export interface PlagiarismMatch {
  source: string;
  similarity: number; // 0-100 percentage
  url?: string;
}

// Simulated plagiarism check for development
export const simulatePlagiarismCheck = (content: string): PlagiarismResult => {
  // Remove HTML tags and count unique words
  const cleanContent = content.replace(/<[^>]*>/g, "");
  const words = cleanContent.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const uniqueWords = new Set(words).size;
  const totalWords = words.length;
  
  // Simple heuristic: if very few unique words, might be plagiarized
  const uniquenessRatio = totalWords > 0 ? (uniqueWords / totalWords) * 100 : 100;
  const plagiarismScore = Math.max(0, 100 - uniquenessRatio);

  return {
    overallScore: Math.round(plagiarismScore),
    matches:
      plagiarismScore > 20
        ? [
            {
              source: "Common online content",
              similarity: Math.round(plagiarismScore * 0.7),
            },
          ]
        : [],
    status: "completed",
  };
};
