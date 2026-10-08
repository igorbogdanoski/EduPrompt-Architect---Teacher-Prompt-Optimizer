/**
 * Helper utility to estimate token count of text, JSON schemas,
 * and Chain-of-thought layers for LLM prompts.
 * 
 * Standard LLM tokenizer heuristic:
 * - 1 token is approximately 3.8 - 4 characters for English and code.
 * - Words average ~1.3 tokens depending on vocabulary and punctuation density.
 */
export function estimateTokenCount(text: string | null | undefined): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  const charCount = trimmed.length;
  const words = trimmed.split(/\s+/).filter(Boolean).length;

  // Blended heuristic: accounts for symbols/brackets in JSON and natural English CoT
  const tokensByChars = charCount / 3.85;
  const tokensByWords = words * 1.25;

  const estimated = Math.round((tokensByChars + tokensByWords) / 2);
  return Math.max(1, estimated);
}

/**
 * Formats a token number nicely, e.g. "320" or "1.2k"
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toLocaleString();
}
