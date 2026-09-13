import type { AccentColor, Analysis, Pattern, VisualFamily } from "./types";
import {
  extractKeywords,
  extractNumbers,
  extractProperNouns,
  hasCjk,
  sentences,
  stripTrailingPunct,
  titleCase,
  wordCount,
} from "./text";

const EDUCATIONAL_HINTS =
  /\b(because|explain|how|why|space|time|gravity|science|energy|atom|history|learn|works|called|compound|interest|black hole|light|planet|cell|dna|brain|earth|mechanism)\b/i;
const MOTIVATIONAL_HINTS =
  /\b(you|your|fear|dream|stop|start|overthink|anxious|confidence|fail|life|ready|wait|procrastinate|habit|motivat)\b/i;
const COMMERCIAL_HINTS =
  /\b(product|app|customers|price|buy|offer|brand|saas|startup|sell|users|feature|subscribe|save time)\b/i;

export function analyzeSource(source: string): Analysis {
  const text = source.trim();
  const parts = sentences(text);
  const keywords = extractKeywords(text);
  const pattern = detectPattern(text);
  const topic = deriveTopic(text, parts, keywords);
  const coreClaim = deriveClaim(text, parts, topic);
  const family = detectFamily(text, keywords, pattern);

  return {
    pattern,
    topic,
    title: titleCase(topic),
    coreClaim,
    hook: deriveHook(coreClaim, pattern, topic),
    sentences: parts,
    keywords,
    numbers: extractNumbers(text),
    properNouns: extractProperNouns(text),
    palette: inferPalette(text, family, pattern),
    tone: inferTone(pattern, family),
    arc: inferArc(pattern),
    bgm: inferBgm(pattern),
    family,
    hasCjk: hasCjk(text),
    sourceWords: wordCount(text),
  };
}

function detectPattern(text: string): Pattern {
  const educational = (text.match(EDUCATIONAL_HINTS) ?? []).length;
  const motivational = (text.match(MOTIVATIONAL_HINTS) ?? []).length;
  const commercial = (text.match(COMMERCIAL_HINTS) ?? []).length + (/\bapp\b/i.test(text) ? 2 : 0);
  if (commercial >= educational && commercial >= motivational && commercial > 0) return "commercial";
  if (motivational > educational) return "motivational";
  return "educational";
}

function detectFamily(text: string, keywords: string[], pattern: Pattern): VisualFamily {
  const blob = `${text} ${keywords.join(" ")}`.toLowerCase();
  if (/black hole|gravity|space|orbit|photon|event horizon/.test(blob)) return "space";
  if (/overthink|fear|anxious|mind|thought|disaster|confidence/.test(blob)) return "mind";
  if (/interest|money|compound|wealth|invest|saving/.test(blob)) return "money";
  if (/habit|streak|routine|two-minute|procrastinate/.test(blob)) return "habit";
  if (/app|product|customers|users|subscribe/.test(blob)) return "product";
  return pattern;
}

function deriveTopic(text: string, parts: string[], keywords: string[]): string {
  if (wordCount(text) <= 12) return stripTrailingPunct(text);
  const about = text.match(/\b(?:about|called|named)\s+([A-Za-z0-9'’ -]{3,40})/i);
  if (about?.[1]) return stripTrailingPunct(about[1]);
  if (keywords.length >= 2) return `${keywords[0]} ${keywords[1]}`;
  if (keywords[0]) return keywords[0];
  return stripTrailingPunct(parts[0] ?? text).split(/\s+/).slice(0, 6).join(" ");
}

function deriveClaim(text: string, parts: string[], topic: string): string {
  const ranked = [...parts].sort((a, b) => scoreClaim(b) - scoreClaim(a));
  if (ranked[0] && scoreClaim(ranked[0]) > 0) return ranked[0];
  if (parts[0]) return parts[0];
  return `${topic} is the idea that needs a clear picture before it can become a video.`;
}

function scoreClaim(sentence: string): number {
  let score = 0;
  if (/\b(so|because|that|cannot|can'?t|is|are)\b/i.test(sentence)) score += 2;
  if (/\b(even|never|always|every)\b/i.test(sentence)) score += 1;
  if (sentence.length > 40 && sentence.length < 220) score += 1;
  return score;
}

function deriveHook(claim: string, pattern: Pattern, topic: string): string {
  const clean = stripTrailingPunct(claim);
  if (pattern === "motivational") {
    return clean.includes("?") ? clean : `The hard part starts before the first step: ${clean}.`;
  }
  if (pattern === "commercial") {
    return `The usual path leaks effort. ${clean}.`;
  }
  if (/^gravity|^light|^compound|^black/i.test(clean)) return clean;
  return `${topic} is easy to name and easy to picture wrongly. ${clean}.`.replace(/\.\./g, ".");
}

function inferPalette(text: string, family: VisualFamily, pattern: Pattern): AccentColor[] {
  if (family === "mind") {
    return [
      { name: "saturated anxiety violet", role: "thought storms and invented futures" },
      { name: "vivid danger red", role: "refusal, cages, and stalled motion" },
      { name: "warm action gold", role: "the first step and the open path" },
    ];
  }
  if (family === "space") {
    return [
      { name: "electric blue", role: "space, orbits, and diagrams" },
      { name: "warm gold", role: "light, energy, and the readable takeaway" },
      { name: "vivid teal", role: "wells, curves, and depth" },
    ];
  }
  if (family === "money") {
    return [
      { name: "warm gold", role: "growth, stacks, and earned gain" },
      { name: "electric blue", role: "time, charts, and the original sum" },
      { name: "vivid teal", role: "regular contributions and compounding" },
    ];
  }
  if (family === "habit" || family === "product" || pattern === "commercial") {
    return [
      { name: "warm gold", role: "the product path and the finished streak" },
      { name: "electric blue", role: "the simple tool and the two-minute action" },
      { name: "vivid red", role: "the broken start and leaked effort" },
    ];
  }
  if (pattern === "motivational") {
    return [
      { name: "vivid red", role: "friction and the stuck pose" },
      { name: "electric blue", role: "recognition and the turning thought" },
      { name: "warm gold", role: "action and the closing callback" },
    ];
  }
  if (/danger|fire|warn|crash/i.test(text)) {
    return [
      { name: "vivid red", role: "warning and force" },
      { name: "electric blue", role: "structure and explanation" },
      { name: "warm gold", role: "resolution" },
    ];
  }
  return [
    { name: "electric blue", role: "setup, diagrams, and the core claim" },
    { name: "vivid teal", role: "transformation and mechanism" },
    { name: "warm gold", role: "consequence and takeaway" },
  ];
}

function inferTone(pattern: Pattern, family: VisualFamily): string {
  if (family === "space") return "clear, curious, and precise";
  if (family === "mind") return "urgent empathy that turns into resolve";
  if (family === "money") return "calm, concrete, and slightly delighted";
  if (pattern === "commercial") return "direct, practical, and unfussy";
  if (pattern === "motivational") return "warm, firm, and forward-moving";
  return "plainspoken, visual, and exact";
}

function inferArc(pattern: Pattern): string {
  if (pattern === "motivational") {
    return "strong hook → recognition → escalation → reframe → action → payoff and CTA";
  }
  if (pattern === "commercial") {
    return "pain point → consequence → product reveal → mechanism → proof → benefit and CTA";
  }
  return "surprising hook → setup → mechanism → consequence → practical meaning → takeaway";
}

function inferBgm(pattern: Pattern): string {
  if (pattern === "motivational") {
    return "Restrained minor-key piano near 72 BPM for the first four clips, then a lift to a 108 BPM drum and warm-synth pulse from clip five.";
  }
  if (pattern === "commercial") {
    return "Dry ticking percussion and muted bass through the pain, then a clean plucked theme and light drums after the product appears.";
  }
  return "Soft analog pulse and held low tones through the setup, adding brighter mallet hits as the mechanism becomes visible, then a resolved final chord.";
}
