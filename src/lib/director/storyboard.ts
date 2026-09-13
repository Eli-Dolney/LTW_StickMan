import type {
  Analysis,
  AspectRatio,
  OverlayNote,
  Scene,
  Theme,
  VisualBeat,
  VisualFamily,
} from "./types";
import { stripTrailingPunct } from "./text";

interface FamilyKit {
  titles: string[];
  purposes: string[];
  metaphors: string[];
  continuity: string[];
  overlays: OverlayNote[];
  devices: string[][];
  audio: string[];
}

const BEAT_RANGES: VisualBeat["range"][] = ["0–3s", "3–7s", "7–10s"];

export function composeScenes(
  analysis: Analysis,
  voiceover: string[],
  aspectRatio: AspectRatio,
  theme: Theme,
): Scene[] {
  const kit = familyKit(analysis.family, analysis.topic);
  const polarity = themeLock(theme);
  const staging = stagingFor(aspectRatio);

  return voiceover.map((vo, index) => {
    const metaphor = kit.metaphors[index];
    const opening = kit.continuity[index];
    const ending = kit.continuity[index + 1];
    const beats = buildBeats(index, metaphor, opening, ending, staging, polarity, analysis);
    return {
      index: index + 1,
      time: `${index * 10}–${(index + 1) * 10}s`,
      title: kit.titles[index],
      purpose: kit.purposes[index],
      beats,
      devices: kit.devices[index],
      motion: `${staging.camera} Keep ${polarity.figure} on ${polarity.background} while ${metaphor}. End by handing ${ending} to the next clip.`,
      vo,
      intent: sceneIntent(vo, kit.purposes[index], metaphor),
      audio: kit.audio[index],
      opening,
      ending,
    };
  });
}

export function overlayNotes(analysis: Analysis, aspectRatio: AspectRatio): OverlayNote[] {
  return familyKit(analysis.family, analysis.topic).overlays.map((overlay) => ({
    ...overlay,
    placement: overlayPlacement(aspectRatio, overlay.placement),
  }));
}

export function compositionCopy(aspectRatio: AspectRatio): string {
  if (aspectRatio === "16:9") {
    return "Stage action across left, center, and right. Use lateral tracking, horizontal match cuts, and deliberate negative space.";
  }
  if (aspectRatio === "9:16") {
    return "Use depth, stacked motion, vertical reveals, foreground passes, and interface-safe placement near the top and bottom.";
  }
  return "Keep action compact and center-weighted. Use short travel paths and avoid crucial events at the extreme edges.";
}

export function themeLock(theme: Theme): {
  background: string;
  figure: string;
  canvasRule: string;
} {
  if (theme === "light") {
    return {
      background: "a flat, uniform, digitally pure-white canvas",
      figure: "one minimalist black stick figure",
      canvasRule:
        "Forbid gray or off-white tint, paper texture, grain, gradients, vignette, shadows, ambient occlusion, lighting falloff, bloom, fog, color grading, and three-dimensional background depth.",
    };
  }
  return {
    background: "a pure black background",
    figure: "one minimalist white stick figure",
    canvasRule: "Keep the field digitally pure black with no gray wash, glow wash, or scenic depth.",
  };
}

export function narratorCopy(voice: "bright-female" | "calm-male" | "warm-female"): string {
  if (voice === "calm-male") {
    return "a calm, clear adult male narrator speaking natural American English";
  }
  if (voice === "warm-female") {
    return "a warm, grounded adult female narrator speaking natural American English";
  }
  return "a bright, energetic adult female narrator speaking natural American English";
}

function stagingFor(aspectRatio: AspectRatio) {
  if (aspectRatio === "16:9") {
    return {
      place: "Place Stick Figure A in the left third and send the metaphor across center toward the right, leaving a clean right margin",
      camera: "Use a lateral track, a horizontal wipe, and a wide push.",
    };
  }
  if (aspectRatio === "9:16") {
    return {
      place: "Stack the reveal from the lower third upward, keep the top interface-safe, and let one object pass through the foreground",
      camera: "Use a vertical reveal, a short push-in, and a foreground pass.",
    };
  }
  return {
    place: "Keep Stick Figure A center-weighted with short travel and a quiet outer margin",
    camera: "Use a short radial push, a compact orbit, and a center hold.",
  };
}

function buildBeats(
  index: number,
  metaphor: string,
  opening: string,
  ending: string,
  staging: { place: string; camera: string },
  polarity: { figure: string; background: string },
  analysis: Analysis,
): VisualBeat[] {
  const accent = analysis.palette[index % 3].name;
    const actions = [
    `${staging.place} on ${polarity.background}. Inherit ${opening}. ${capitalize(polarity.figure)} reads the still frame while ${metaphor} is only a hint in ${accent}.`,
    `Transform the hint: ${metaphor} grows, splits, or bends. The camera commits. Icon-only marks and ${accent} carry the spoken idea, never letters.`,
    `Deliver the beat’s climax and leave ${ending} filling or exiting the frame so the next clip can inherit it exactly.`,
  ];
  return BEAT_RANGES.map((range, beatIndex) => ({
    range,
    action: actions[beatIndex],
  }));
}

function sceneIntent(vo: string, purpose: string, metaphor: string): string {
  return `${purpose}: the voiceover says “${stripTrailingPunct(vo).split(" ").slice(0, 12).join(" ")}…”, and the picture answers with ${metaphor}.`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function overlayPlacement(aspectRatio: AspectRatio, fallback: string): string {
  if (aspectRatio === "16:9") return "right-third safe margin, added in edit, never generated";
  if (aspectRatio === "9:16") return "lower-third interface-safe band, added in edit, never generated";
  return fallback || "center-right quiet margin, added in edit, never generated";
}

function familyKit(family: VisualFamily, topic: string): FamilyKit {
  const kits: Record<VisualFamily, FamilyKit> = {
    space: {
      titles: ["The dent", "The well", "The curve", "The climb", "The horizon", "The takeaway"],
      purposes: [
        "Surprising hook",
        "Setup the fabric",
        "Show the mechanism",
        "Show the consequence",
        "Give the idea a usable picture",
        "Close on the takeaway",
      ],
      metaphors: [
        "a faint fabric sheet taking a first dent",
        "a deepening gravity well drawn as teal line-art",
        "electric-blue light rays bending toward the well",
        "a single gold photon failing to climb back out",
        "a dark disk with a thin gold ring",
        "A walking the ring while the well stays readable in the distance",
      ],
      continuity: [
        "A standing in empty space facing a faint sheet",
        "the sheet filling the frame as a line-art grid",
        "the camera already inside the deepening well",
        "curved light streaks filling the lens",
        "a dark disk covering the frame",
        "the disk pulling back to a thin gold ring",
        "A walking the ring toward a quiet overlay-safe margin",
      ],
      overlays: [
        { clip: 1, text: "NOT A PULL", placement: "right margin" },
        { clip: 6, text: "GRAVITY IS SHAPE", placement: "quiet margin" },
      ],
      devices: repeatDevices([
        ["expressive pose", "concrete metaphor", "camera push", "environmental change"],
        ["diagram lines", "environmental transformation", "camera track", "icon-only grid"],
        ["particle light", "camera orbit", "visual metaphor", "foreground wipe"],
        ["failed climb", "energy particles", "camera shake", "match-cut ready ending"],
        ["shape morph", "ring reveal", "camera pull", "icon-only disk"],
        ["walking figure", "held metaphor", "camera pull-out", "clean negative space"],
      ]),
      audio: spaceAudio(),
    },
    mind: {
      titles: ["Thought storm", "Imagined failures", "Fear as restraint", "The reframe", "One small move", "Fear loses voltage"],
      purposes: [
        "Strong hook",
        "Audience recognition",
        "Escalate the trap",
        "Reframe the cause",
        "Call for a tiny action",
        "Payoff and CTA",
      ],
      metaphors: [
        "a violet thought-dot splitting into a rotating tangle",
        "icon-only disaster bubbles: a fall, a rejected mark, a pointing crowd",
        "red vines tightening around the ankles on a treadmill that goes nowhere",
        "a gold beam cutting the spiral and becoming a road",
        "gold energy in the hands as the vines snap and an icon-only send arrow appears",
        "a gold shockwave turning the tangle into stars on a climbing path",
      ],
      continuity: [
        "A alone in empty space with lowered shoulders",
        "violet lines filling the entire frame",
        "red prison bars stretching downward",
        "a gold beam spanning the full width",
        "a glass-like fragment wiping the lens",
        "A’s raised right foot held just before it lands",
        "A climbing a gold path toward a quiet overlay-safe horizon",
      ],
      overlays: [
        { clip: 2, text: "WHAT IF?", placement: "safe margin" },
        { clip: 6, text: "START MOVING", placement: "quiet margin" },
      ],
      devices: repeatDevices([
        ["pose", "thought metaphor", "clock and battery icons", "full-frame wipe"],
        ["travel through tangle", "icon-only rejection marks", "orbit", "prison morph"],
        ["vine restraint", "treadmill environment", "spiral particles", "gold cut"],
        ["beam-to-road morph", "second figure interaction", "glass shatter", "lens wipe"],
        ["energy along arms", "vine snap", "icon-only actions", "held foot"],
        ["shockwave", "star particles", "folding mountain path", "pull-out"],
      ]),
      audio: mindAudio(),
    },
    money: {
      titles: ["The small start", "Interest on interest", "The quiet stack", "Time as fuel", "The visible curve", "Keep adding"],
      purposes: [
        "Surprising hook",
        "Setup the original sum",
        "Show compounding",
        "Show time as the multiplier",
        "Make the curve readable",
        "Close with a repeatable action",
      ],
      metaphors: [
        "a single gold coin-dot that looks too small",
        "an electric-blue original stack beside a thinner teal gain",
        "each gold gain sprouting a smaller gold gain",
        "a teal clock-hand sweeping while the stack steps upward",
        "an icon-only rising curve drawn without numbers",
        "A placing one more small gold dot on the path",
      ],
      continuity: [
        "A holding one tiny gold dot in empty space",
        "the gold dot filling the frame",
        "a two-part stack already on screen",
        "tiny gold sprouts covering the lens",
        "a clock-hand wiping across the frame",
        "an unmarked rising curve holding the frame",
        "A adding one more dot beside a quiet overlay-safe margin",
      ],
      overlays: [
        { clip: 3, text: "GAIN ON GAIN", placement: "quiet margin" },
        { clip: 6, text: "ADD THE NEXT", placement: "quiet margin" },
      ],
      devices: repeatDevices([
        ["tiny object scale", "pose of doubt", "camera push", "dot as metaphor"],
        ["split-stack diagram", "color roles", "lateral compare", "icon-only bars"],
        ["sprouting particles", "environmental growth", "orbit", "lens fill"],
        ["clock icon", "stepped growth", "camera track", "time metaphor"],
        ["curve draw", "camera pull", "no numerals", "shape morph"],
        ["placing action", "path continuation", "held ending", "negative space"],
      ]),
      audio: moneyAudio(),
    },
    habit: {
      titles: ["The empty week", "The broken streak", "The two-minute door", "The visible mark", "The path appears", "Repeat tomorrow"],
      purposes: [
        "Name the pain",
        "Show the leak",
        "Reveal the smaller door",
        "Show the mechanism",
        "Show proof",
        "Ask for the first step",
      ],
      metaphors: [
        "an empty seven-dot week with the first dots already faded",
        "a vivid-red broken streak snapping in the hand",
        "a narrow electric-blue doorway labeled only by its shape",
        "one gold tick appearing after a two-beat action",
        "a clean gold path of ticks with no numerals",
        "A stepping through the doorway onto tomorrow’s first mark",
      ],
      continuity: [
        "A facing an empty week of faded dots",
        "the faded week filling the frame",
        "a snapped red streak in the foreground",
        "a narrow blue doorway filling the frame",
        "a single gold tick holding the lens",
        "a path of ticks leading forward",
        "A frozen mid-step onto the next mark, overlay-safe on one side",
      ],
      overlays: [
        { clip: 3, text: "TWO MINUTES", placement: "quiet margin" },
        { clip: 6, text: "KEEP THE STREAK", placement: "quiet margin" },
      ],
      devices: repeatDevices([
        ["empty calendar icons", "slumped pose", "camera push", "fade"],
        ["snap", "red accent", "foreground object", "frustration pose"],
        ["doorway metaphor", "scale change", "camera track", "narrow reveal"],
        ["tick mark", "two-beat action", "gold accent", "match cut"],
        ["path of ticks", "camera pull", "clean design", "no numerals"],
        ["step interaction", "held pose", "path continuation", "negative space"],
      ]),
      audio: habitAudio(),
    },
    product: {
      titles: ["Leaking effort", "The heavy tool", "A narrower door", "How it works", "Proof you can see", "Start small"],
      purposes: [
        "Pain point",
        "Consequence of the old way",
        "Product reveal",
        "Mechanism",
        "Proof or use case",
        "Benefit and CTA",
      ],
      metaphors: [
        "effort leaking from a cracked container",
        "an oversized tool pinning A in place",
        "a simple gold device appearing at human scale",
        "one action in, one mark out, drawn as icon-only flow",
        "a short proof path of three clean marks",
        "A carrying the small device onto an open path",
      ],
      continuity: [
        "A beside a cracked container losing dots",
        "leaking dots filling the frame",
        "the oversized tool covering the lens",
        "the small gold device filling the frame",
        "the action-to-mark flow holding the lens",
        "three proof marks across the frame",
        "A walking the open path with a quiet overlay-safe side",
      ],
      overlays: [
        { clip: 3, text: "ONE ACTION", placement: "quiet margin" },
        { clip: 6, text: "START TODAY", placement: "quiet margin" },
      ],
      devices: repeatDevices([
        ["leak particles", "cracked object", "slumped pose", "camera push"],
        ["oversized object", "pinning interaction", "camera shake", "red accent"],
        ["scale morph", "gold reveal", "camera settle", "human-scale tool"],
        ["icon-only flow", "arrow without text", "match cut", "blue accent"],
        ["three-mark proof", "camera track", "clean spacing", "held beats"],
        ["walk-off", "path", "pull-out", "negative space"],
      ]),
      audio: productAudio(),
    },
    educational: genericKit(topic, "educational"),
    motivational: genericKit(topic, "motivational"),
    commercial: genericKit(topic, "commercial"),
  };

  return kits[family];
}

function genericKit(topic: string, kind: "educational" | "motivational" | "commercial"): FamilyKit {
  if (kind === "motivational") {
    return {
      titles: ["The early weight", "The familiar loop", "The tighter wrap", "The real cause", "The small move", "The open path"],
      purposes: ["Strong hook", "Recognition", "Escalation", "Reframe", "Action", "Payoff and CTA"],
      metaphors: [
        `a heavy unmarked block labeled only by its mass, standing in for ${topic}`,
        "a looping path that returns A to the same mark",
        "lines wrapping the feet while the chest leans forward",
        "the block cracking to show it was only a drawing",
        "one gold step placed on a short path",
        "the path continuing while the old loop dissolves",
      ],
      continuity: [
        "A facing a heavy unmarked block",
        "the block filling the frame",
        "the looping path already underfoot",
        "wrapping lines covering the lens",
        "the cracked drawing filling the frame",
        "one gold step held in the foreground",
        "A walking the open path beside a quiet margin",
      ],
      overlays: [
        { clip: 2, text: "THE LOOP", placement: "quiet margin" },
        { clip: 6, text: "TAKE THE STEP", placement: "quiet margin" },
      ],
      devices: repeatDevices([
        ["heavy object", "pose", "push", "metaphor"],
        ["loop path", "repeat motion", "track", "icon-only mark"],
        ["wrapping lines", "struggle", "low camera", "particles"],
        ["crack reveal", "reframe", "shatter", "wipe"],
        ["single step", "gold accent", "held foot", "path"],
        ["walk", "dissolve", "pull-out", "negative space"],
      ]),
      audio: mindAudio(),
    };
  }
  if (kind === "commercial") {
    return genericKit(topic, "educational");
  }
  return {
    titles: ["Wrong picture", "Still frame", "The moving part", "The cost", "The usable read", "The one-breath takeaway"],
    purposes: ["Surprising hook", "Setup", "Mechanism", "Consequence", "Practical meaning", "Takeaway"],
    metaphors: [
      `an oversized question-shape beside a small honest model of ${topic}`,
      `a still diagram of ${topic} held in the center`,
      `the diagram’s moving part, drawn in vivid teal`,
      `the consequence landing as a gold change in the same diagram`,
      `A walking around the diagram, reading it from another angle`,
      `the diagram shrinking to a keepable object in A’s hand`,
    ],
    continuity: [
      "A beside an oversized icon-only question-shape",
      "the question-shape filling the frame",
      "the still diagram already centered",
      "the moving teal part covering the lens",
      "the gold consequence change holding the frame",
      "A circling the diagram",
      "A holding the small keepable object beside a quiet margin",
    ],
    overlays: [
      { clip: 1, text: "WRONG PICTURE", placement: "quiet margin" },
      { clip: 6, text: "KEEP THE SHAPE", placement: "quiet margin" },
    ],
    devices: repeatDevices([
      ["scale contrast", "question icon", "pose", "push"],
      ["still diagram", "center hold", "no numerals", "clean lines"],
      ["moving part", "teal accent", "orbit", "transformation"],
      ["gold change", "impact", "camera settle", "same diagram"],
      ["walk-around", "new angle", "track", "readable space"],
      ["shrink morph", "held object", "pull-out", "negative space"],
    ]),
    audio: spaceAudio(),
  };
}

function repeatDevices(rows: string[][]): string[][] {
  return rows.map((row) => row.slice(0, 6));
}

function spaceAudio(): string[] {
  return [
    "Soft analog pulse, a single tick as the dent appears, voice leading.",
    "Low held tone, paper-like sheet rustle, no melody yet.",
    "Mallet hits synced to each bending ray; keep voice first.",
    "A short failed-climb whoosh and a darker bed; no extra words.",
    "A clean ring chime as the disk settles.",
    "Resolved final chord, footsteps, then air for the last line.",
  ];
}

function mindAudio(): string[] {
  return [
    "Minor piano near 72 BPM, clock tick, rising rumble.",
    "Wind, a fall impact, nonverbal crowd hush, two stamp hits.",
    "Heartbeat, vine creak, treadmill scrape, then a clean gold cut.",
    "Piano warms; running steps, reconstruction clicks, glass break.",
    "Lift to 108 BPM drums; energy charge, snap, send-whoosh, held step.",
    "Stronger drums, shockwave, star shimmer, climbing steps, resolved hit.",
  ];
}

function moneyAudio(): string[] {
  return [
    "One soft coin-like tick, almost no music.",
    "Two-note bass as the stacks compare.",
    "Light sprouting clicks, rising mallet pattern.",
    "A slow sweep like a clock, stacked steps on the off-beat.",
    "A clean curve-draw tone, still voice-first.",
    "A small placing tap and a resolved major chord.",
  ];
}

function habitAudio(): string[] {
  return [
    "Dry ticks that miss the last two beats.",
    "A snap, a short drop in the bed.",
    "A narrower, cleaner tone as the door appears.",
    "Two action hits and one gold tick.",
    "A simple repeating motif aligned to the path.",
    "A step, then a held final note.",
  ];
}

function productAudio(): string[] {
  return [
    "Hiss of leaking dots, dry percussion.",
    "A heavy thud as the oversized tool lands.",
    "The bed clears; a small gold chime.",
    "Two functional clicks for action-in and mark-out.",
    "Three proof tones, even and short.",
    "A walking rhythm and a short resolved sting.",
  ];
}
