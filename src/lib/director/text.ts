const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "then",
  "there",
  "these",
  "this",
  "to",
  "was",
  "were",
  "will",
  "with",
  "you",
  "your",
  "we",
  "they",
  "not",
  "can",
  "cannot",
  "so",
  "than",
  "too",
  "very",
  "just",
  "about",
  "over",
  "after",
  "before",
]);

export function wordCount(text: string): number {
  return tokenize(text).length;
}

export function tokenize(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[^A-Za-z0-9'’-]+|[^A-Za-z0-9'’-]+$/g, ""))
    .filter(Boolean);
}

export function sentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function hasCjk(text: string): boolean {
  return /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(text);
}

export function ensurePeriod(text: string): string {
  const trimmed = text.trim().replace(/\.+/g, ".");
  if (!trimmed) return "";
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

export function stripTrailingPunct(text: string): string {
  return text.replace(/[.!?,;:]+$/g, "").trim();
}

export function titleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && STOP_WORDS.has(lower) && lower.length <= 4) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function extractNumbers(text: string): string[] {
  const matches = text.match(/\b\d+(?:,\d{3})*(?:\.\d+)?%?\b/g);
  return matches ? Array.from(new Set(matches)) : [];
}

export function extractKeywords(text: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    const word = token.toLowerCase();
    if (word.length < 4 || STOP_WORDS.has(word) || /^\d+$/.test(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

export function extractProperNouns(text: string): string[] {
  const found = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) ?? [];
  return Array.from(new Set(found)).filter((name) => !STOP_WORDS.has(name.toLowerCase()));
}

export function clipWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text.trim();
  const weak = new Set(["a", "an", "and", "the", "to", "of", "in", "on", "or", "just", "not", "as"]);
  const clipped = words.slice(0, max);
  while (clipped.length > 8) {
    const last = clipped[clipped.length - 1].replace(/[^A-Za-z]/g, "").toLowerCase();
    if (!weak.has(last)) break;
    clipped.pop();
  }
  return ensurePeriod(stripTrailingPunct(clipped.join(" ")));
}

export function joinBeats(beats: string[]): string {
  return beats.map((beat) => ensurePeriod(beat)).join(" ");
}

export function estimatedSeconds(words: number): number {
  return Math.round((words / 2.4) * 10) / 10;
}
