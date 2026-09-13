import type { ClipPrompt, ProductionPackage, Proposal, Scene } from "./types";
import { narratorCopy, themeLock } from "./storyboard";

const NEGATIVE = [
  "photorealism",
  "unwanted 3D rendering",
  "faces",
  "hair",
  "clothing",
  "filled bodies",
  "extra limbs",
  "malformed anatomy",
  "disconnected lines",
  "changed proportions",
  "broken or changing line weight",
  "inverted theme colors",
  "unexplained colors",
  "unintended characters",
  "unrelated spectacle",
  "visible writing",
  "letters",
  "numbers",
  "technical color notation",
  "palette labels",
  "interface copy",
  "captions",
  "subtitles",
  "logos",
  "watermarks",
].join(", ");

export function composePackage(proposal: Proposal): ProductionPackage {
  const polarity = themeLock(proposal.theme);
  const narrator = narratorCopy(proposal.voice);
  const paletteLine = proposal.palette
    .map((color) => `${color.name} for ${color.role}`)
    .join("; ");

  const prompts = proposal.scenes.map((scene, index) =>
    buildPrompt(proposal, scene, index, polarity, narrator, paletteLine),
  );

  return {
    continuity: [
      `Six approximately ten-second clips; ${proposal.aspectRatio}; 720p target; 24 FPS; synchronized audio.`,
      `${capitalize(polarity.background)} with ${polarity.figure}s and matching line art.`,
      "Hollow circular head, no face, no hair, no clothing, no filled body, stable proportions, uniform medium line weight.",
      `${paletteLine}. Use ordinary color names only. Never write hexadecimal, RGB, HSL, or Pantone notation.`,
      `${capitalize(narrator)}.`,
      proposal.composition,
      "Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.",
      "Generate no visible writing. Keep every card, bubble, clock, meter, notification, and interface element icon-only.",
    ],
    prompts,
    stitching: proposal.scenes.map((scene, index) => {
      const next = proposal.scenes[index + 1];
      if (!next) {
        return `Clip ${scene.index} holds ${scene.ending} for about 12–18 frames so a post-production overlay can sit in the reserved quiet margin.`;
      }
      return `Clip ${scene.index} ends on ${scene.ending} → Clip ${next.index} opens on ${next.opening}.`;
    }),
    audioNote:
      "Independent text-only generations may vary in voice and music. Reuse the same voice or audio reference when the interface allows it, and repeat the identical narrator description in every prompt. For maximum consistency, keep synchronized SFX from each clip and add one continuous external English voiceover and BGM track during assembly.",
  };
}

export function exportPackageMarkdown(proposal: Proposal, pack: ProductionPackage): string {
  const overlayLines = proposal.overlays
    .map((overlay) => `- Clip ${overlay.clip}: “${overlay.text}” (${overlay.placement})`)
    .join("\n");

  return [
    `# ${proposal.title}`,
    "",
    `Core message: ${proposal.coreMessage}`,
    `Hook: ${proposal.hook}`,
    `Format: ${proposal.aspectRatio} · ${proposal.theme} theme · ${proposal.wordCount} words · ~${proposal.durationSeconds}s`,
    `Narrator: ${proposal.narrator}`,
    `Tone: ${proposal.tone}`,
    `Arc: ${proposal.arc}`,
    `BGM: ${proposal.bgm}`,
    "",
    "## English voiceover",
    "",
    proposal.voiceover,
    "",
    "## Global continuity",
    "",
    pack.continuity.map((line) => `- ${line}`).join("\n"),
    "",
    "## Optional post-production overlays",
    "",
    "Add these in the edit. Never put them inside a generation prompt.",
    overlayLines,
    "",
    ...pack.prompts.flatMap((clip, index) => [
      `## Clip ${index + 1} — ${clip.title}`,
      "",
      "```text",
      clip.prompt,
      "```",
      "",
    ]),
    "## Stitching guide",
    "",
    pack.stitching.map((line, index) => `${index + 1}. ${line}`).join("\n"),
    "",
    "## Voice and music continuity",
    "",
    pack.audioNote,
    "",
  ].join("\n");
}

function buildPrompt(
  proposal: Proposal,
  scene: Scene,
  index: number,
  polarity: ReturnType<typeof themeLock>,
  narrator: string,
  paletteLine: string,
): ClipPrompt {
  const ratioLine =
    proposal.aspectRatio === "16:9"
      ? "16:9 horizontal"
      : proposal.aspectRatio === "9:16"
        ? "9:16 vertical"
        : "1:1 square";
  const accent = proposal.palette[index % 3];
  const beats = scene.beats.map((beat) => `[${beat.range}] ${beat.action}`).join("\n");

  const prompt = `Create an approximately 10-second ${ratioLine} 2D kinetic motion-graphics clip targeting 720p at 24 FPS with synchronized audio.

Use ${polarity.background} and ${polarity.figure}, Stick Figure A. Lock a hollow circular head, no face, no hair, no clothing, no filled body, stable human-like proportions, and uniform medium line weight. ${polarity.canvasRule} Use only ${paletteLine}. This clip primarily uses ${accent.name}. Treat these ordinary color names as visual art direction only. ${proposal.composition} Generate no visible words, letters, numbers, technical annotations, captions, subtitles, or interface text; keep every graphic icon-only.

First frame: inherit ${scene.opening}.

${beats}

Audio-only dialogue, exactly once: “${scene.vo}” Do not display or transcribe the dialogue visually.

Use the same ${narrator}. Deliver this clip with ${deliveryFor(index, proposal.tone)}. ${scene.audio} Keep the voice dominant over BGM and effects. Synchronize effects to visible impacts, transformations, and wipes.

End on ${scene.ending} so the next clip can inherit that state.

Use rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency.

Do not generate ${NEGATIVE}. Do not alter, omit, repeat, reorder, or add dialogue.`;

  return { title: scene.title, prompt };
}

function deliveryFor(index: number, tone: string): string {
  const beats = [
    "an opening hook and urgent clarity",
    "steady setup energy",
    "focused explanatory drive",
    "a firmer turn",
    "decisive forward motion",
    "warm conviction and a clean landing",
  ];
  return `${beats[index]}, staying ${tone}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
