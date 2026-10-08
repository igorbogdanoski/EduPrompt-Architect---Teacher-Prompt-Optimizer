export interface LessonReadingMetrics {
  wordCount: number;
  characterCount: number;
  estimatedReadTimeMinutes: number;
  estimatedInstructionalMinutes: number;
}

/**
 * Calculates estimated word count and read time for classroom content.
 * - Standard educational silent reading: ~200-220 words per minute.
 * - Teacher instructional pacing (interactive read-aloud): ~130-150 words per minute.
 */
export function calculateLessonMetrics(text: string | null | undefined): LessonReadingMetrics {
  if (!text || !text.trim()) {
    return {
      wordCount: 0,
      characterCount: 0,
      estimatedReadTimeMinutes: 0,
      estimatedInstructionalMinutes: 0,
    };
  }

  const trimmed = text.trim();
  // Unicode-aware word matching supporting Latin, Cyrillic, and numbers
  const words = trimmed.match(/[\p{L}\p{N}'-]+/gu) || [];
  const wordCount = words.length;
  const characterCount = trimmed.length;

  const estimatedReadTimeMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;
  const estimatedInstructionalMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 130)) : 0;

  return {
    wordCount,
    characterCount,
    estimatedReadTimeMinutes,
    estimatedInstructionalMinutes,
  };
}
