interface QuoteLike { id: string }

export function selectInitialQuote<T extends QuoteLike>(quotes: T[], savedId: string | null): T | null {
  if (!quotes.length) return null;
  return quotes.find((quote) => quote.id === savedId) ?? quotes[0];
}

export function selectNextQuote<T extends QuoteLike>(quotes: T[], currentId: string): T {
  if (!quotes.length) throw new Error('句子列表为空');
  const index = quotes.findIndex((quote) => quote.id === currentId);
  return quotes[(Math.max(index, 0) + 1) % quotes.length];
}

export function canLoadVideo(input: { mobile: boolean; reducedMotion: boolean }): boolean {
  return !input.mobile && !input.reducedMotion;
}
