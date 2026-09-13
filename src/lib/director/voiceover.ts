import type { Analysis, Pattern } from "./types";
import {
  clipWords,
  ensurePeriod,
  joinBeats,
  stripTrailingPunct,
  tokenize,
  wordCount,
} from "./text";

const MIN_TOTAL = 130;
const MAX_TOTAL = 150;
const MIN_BEAT = 18;
const MAX_BEAT = 26;

export function composeVoiceover(analysis: Analysis): string[] {
  const drafted = draftBeats(analysis).map((beat) => fitBeat(beat, MIN_BEAT, MAX_BEAT));
  return fitTotal(drafted, MIN_TOTAL, MAX_TOTAL);
}

export function voiceoverTranscript(beats: string[]): string {
  return joinBeats(beats);
}

function draftBeats(analysis: Analysis): string[] {
  if (analysis.sourceWords >= 70 && analysis.sentences.length >= 4) {
    return fromLongSource(analysis);
  }
  if (analysis.sourceWords >= 25 && analysis.sentences.length >= 2) {
    return fromMediumSource(analysis);
  }
  return fromTopic(analysis);
}

function fromTopic(analysis: Analysis): string[] {
  const claim = stripTrailingPunct(analysis.coreClaim);
  const topic = analysis.topic;
  const split = splitClaim(claim);
  return templatesFor(analysis.pattern, topic, claim, split);
}

function fromMediumSource(analysis: Analysis): string[] {
  const [first, second, third] = analysis.sentences;
  const claim = stripTrailingPunct(analysis.coreClaim);
  const topic = analysis.topic;
  const extras = analysis.sentences.slice(3).join(" ");
  return templatesFor(analysis.pattern, topic, claim, {
    setup: first ?? claim,
    mechanism: second ?? claim,
      consequence: third ?? (extras || claim),
  });
}

function fromLongSource(analysis: Analysis): string[] {
  const picks = pickSentences(analysis.sentences);
  const topic = analysis.topic;
  const claim = stripTrailingPunct(analysis.coreClaim);
  return [
    `Here is the opening that matters. ${picks[0]}`,
    `Stay with the setup. ${picks[1] ?? `We are looking at ${topic}, and only at what the source actually says.`}`,
    `Watch the turn. ${picks[2] ?? claim}`,
    `Then the cost of ignoring it becomes visible. ${picks[3] ?? claim}`,
    `So the useful move is practical, not theatrical. ${picks[4] ?? `Use ${topic} as a picture you can keep.`}`,
    `Close on the same claim you can repeat: ${claim}.`,
  ];
}

function pickSentences(parts: string[]): string[] {
  if (parts.length <= 6) return parts;
  const indexes = [
    0,
    Math.floor(parts.length * 0.2),
    Math.floor(parts.length * 0.4),
    Math.floor(parts.length * 0.6),
    Math.floor(parts.length * 0.8),
    parts.length - 1,
  ];
  return Array.from(new Set(indexes)).map((index) => parts[index]);
}

function splitClaim(claim: string): { setup: string; mechanism: string; consequence: string } {
  const soThat = claim.match(/^(.*?)\s+so\s+(.*?)\s+that\s+(.*)$/i);
  if (soThat) {
    return {
      setup: soThat[1],
      mechanism: `${soThat[1]} so ${soThat[2]}`,
      consequence: soThat[3],
    };
  }
  const because = claim.match(/^(.*?)\s+because\s+(.*)$/i);
  if (because) {
    return {
      setup: because[1],
      mechanism: because[2],
      consequence: because[1],
    };
  }
  return {
    setup: claim,
    mechanism: claim,
    consequence: claim,
  };
}

function templatesFor(
  pattern: Pattern,
  topic: string,
  claim: string,
  split: { setup: string; mechanism: string; consequence: string },
): string[] {
  const setup = ensurePeriod(split.setup);
  const mechanism = ensurePeriod(split.mechanism);
  const consequence = ensurePeriod(split.consequence);
  const claimLine = ensurePeriod(claim);

  if (pattern === "motivational") {
    return [
      `Do you feel the weight before anything has started? ${claimLine} The disaster is still imaginary, and it is already heavy.`,
      `You recognize the loop. Before the first step, the mind rehearses failure, judgment, and every way ${topic} could go wrong.`,
      `The longer you hunt for certainty, the tighter the picture wraps around your feet. ${setup} Waiting becomes another kind of work.`,
      `But the thing that hurts is rarely the real event. It is the future the mind keeps inventing. Action does not require confidence.`,
      `Interrupt the loop. Choose one small move you can finish now, then do that move while the picture is still simple.`,
      `The moment you move, the invented future loses voltage. Stop waiting to feel ready. Try, miss, grow, and prove the thought is not in charge.`,
    ];
  }

  if (pattern === "commercial") {
    return [
      `Most attempts leak in the first week. ${claimLine} The problem is not ambition. It is a path that disappears.`,
      `You feel the empty start: no proof, a broken streak, and a tool that asks for more energy than the habit itself.`,
      `Then the product appears as a narrower door. ${setup} One small action. One visible mark. Nothing extra on the screen.`,
      `Watch the mechanism. ${mechanism} Each finished action becomes the next foothold instead of another forgotten promise.`,
      `That is the proof you can show: a clean streak, a two-minute win, and a path you can see when motivation is quiet.`,
      `Keep the benefit small enough to repeat. Start the first imperfect step today, and let ${topic} hold the line you would otherwise drop.`,
    ];
  }

  return [
    `Here is the part people skip: ${claimLine} The name is familiar. The picture is usually wrong.`,
    `Start with a still frame. We are talking about ${topic}. Hold the source claim in place before anything bends, grows, or escapes.`,
    `Now watch the mechanism. ${mechanism} The motion is the meaning, not a decoration around the sentence.`,
    `Then the consequence arrives. ${consequence} Do not add a bigger fact than the source allows. Let the image finish the line.`,
    `So the practical meaning is simple. If ${topic} works this way, the next time you meet it you can read the shape, not just the label.`,
    `Keep this takeaway: ${claimLine} Remember the picture, and you can explain it in one breath without dressing it up.`,
  ];
}

function fitBeat(text: string, min: number, max: number): string {
  let next = ensurePeriod(text.replace(/\s+/g, " ").replace(/\.\./g, "."));
  const fillers = [
    "Keep the claim exact.",
    "Watch the picture, not the label.",
    "Let the image carry the meaning.",
    "Do not invent a larger fact.",
  ];
  let fillerIndex = 0;
  while (wordCount(next) < min && fillerIndex < fillers.length) {
    next = `${next} ${fillers[fillerIndex++]}`;
  }
  if (wordCount(next) > max) {
    next = clipWords(next, max);
  }
  return ensurePeriod(next);
}

function fitTotal(beats: string[], min: number, max: number): string[] {
  const next = [...beats];
  let total = wordCount(joinBeats(next));
  let guard = 0;
  while (total < min && guard < 12) {
    const index = next.findIndex((beat) => wordCount(beat) < MAX_BEAT);
    const target = index === -1 ? next.length - 1 : index;
    next[target] = ensurePeriod(`${stripTrailingPunct(next[target])}, and the picture stays honest`);
    if (wordCount(next[target]) > MAX_BEAT) {
      next[target] = clipWords(next[target], MAX_BEAT);
    }
    total = wordCount(joinBeats(next));
    guard += 1;
  }
  guard = 0;
  while (total > max && guard < 12) {
    const index = next.reduce((longest, beat, i, arr) => (wordCount(beat) > wordCount(arr[longest]) ? i : longest), 0);
    const words = tokenize(next[index]);
    if (words.length > MIN_BEAT) {
      next[index] = clipWords(next[index], words.length - 1);
    } else {
      break;
    }
    total = wordCount(joinBeats(next));
    guard += 1;
  }
  return next.map((beat) => ensurePeriod(beat));
}
