import { analyzeSource } from "./analyze";
import { composePackage, exportPackageMarkdown } from "./prompts";
import { composeScenes, compositionCopy, narratorCopy, overlayNotes } from "./storyboard";
import type { DirectorInput, ProductionPackage, Proposal } from "./types";
import { composeVoiceover, voiceoverTranscript } from "./voiceover";
import { estimatedSeconds, wordCount } from "./text";

export function composeProposal(input: DirectorInput): Proposal {
  const source = input.source.trim();
  if (!source) {
    throw new Error("Paste a topic, notes, or a short script before composing.");
  }

  const analysis = analyzeSource(source);
  if (analysis.hasCjk && analysis.sourceWords < 8) {
    throw new Error(
      "This studio writes English voiceover from English copy. Paste an English topic or use a sample.",
    );
  }

  const voice = input.voice ?? "bright-female";
  const beats = composeVoiceover(analysis);
  const voiceover = voiceoverTranscript(beats);
  const scenes = composeScenes(analysis, beats, input.aspectRatio, input.theme);

  return {
    title: analysis.title,
    coreMessage: analysis.coreClaim,
    hook: analysis.hook,
    aspectRatio: input.aspectRatio,
    theme: input.theme,
    voice,
    narrator: narratorCopy(voice),
    wordCount: wordCount(voiceover),
    durationSeconds: estimatedSeconds(wordCount(voiceover)),
    palette: analysis.palette,
    bgm: analysis.bgm,
    tone: analysis.tone,
    arc: analysis.arc,
    pattern: analysis.pattern,
    voiceover,
    scenes,
    overlays: overlayNotes(analysis, input.aspectRatio),
    composition: compositionCopy(input.aspectRatio),
  };
}

export function updateSceneVoiceover(proposal: Proposal, index: number, vo: string): Proposal {
  const scenes = proposal.scenes.map((scene) =>
    scene.index === index ? { ...scene, vo: vo.trim() } : scene,
  );
  const voiceover = scenes.map((scene) => scene.vo).join(" ");
  return {
    ...proposal,
    scenes,
    voiceover,
    wordCount: wordCount(voiceover),
    durationSeconds: estimatedSeconds(wordCount(voiceover)),
  };
}

export function validateProposal(proposal: Proposal): string[] {
  const errors: string[] = [];
  if (proposal.scenes.length !== 6) errors.push("Proposal must contain exactly six scenes.");
  if (proposal.wordCount < 130 || proposal.wordCount > 150) {
    errors.push(`English voiceover must be 130–150 words (got ${proposal.wordCount}).`);
  }
  for (const scene of proposal.scenes) {
    if (scene.beats.length !== 3) errors.push(`Scene ${scene.index} needs three timed beats.`);
    if (scene.devices.length < 4) errors.push(`Scene ${scene.index} needs at least four visual devices.`);
    if (!scene.vo.trim()) errors.push(`Scene ${scene.index} is missing voiceover.`);
    if (!scene.opening || !scene.ending) errors.push(`Scene ${scene.index} is missing continuity.`);
  }
  for (let i = 0; i < proposal.scenes.length - 1; i += 1) {
    if (!proposal.scenes[i].ending || !proposal.scenes[i + 1].opening) {
      errors.push(`Missing continuity between scenes ${i + 1} and ${i + 2}.`);
    }
  }
  if (proposal.palette.length > 3) errors.push("Use at most three accent colors.");
  const blob = JSON.stringify(proposal);
  if (/#(?:[0-9a-fA-F]{3}){1,2}\b|\brgb\(|\bhsl\(|\bpantone\b/i.test(blob)) {
    errors.push("Technical color notation is not allowed in the proposal.");
  }
  return errors;
}

export function validatePackage(pack: ProductionPackage, proposal: Proposal): string[] {
  const errors: string[] = [];
  if (pack.prompts.length !== 6) errors.push("Package must contain exactly six prompts.");
  for (const [index, clip] of pack.prompts.entries()) {
    const prompt = clip.prompt;
    if (!prompt.includes(proposal.aspectRatio) && !prompt.includes(ratioPhrase(proposal.aspectRatio))) {
      errors.push(`Prompt ${index + 1} is missing the aspect ratio.`);
    }
    if (!prompt.includes("[0–3s]") || !prompt.includes("[3–7s]") || !prompt.includes("[7–10s]")) {
      errors.push(`Prompt ${index + 1} is missing timed beats.`);
    }
    if (!prompt.includes(proposal.scenes[index].vo)) {
      errors.push(`Prompt ${index + 1} does not quote the approved voiceover.`);
    }
    if (!/audio-only dialogue/i.test(prompt)) {
      errors.push(`Prompt ${index + 1} must mark dialogue as audio-only.`);
    }
    if (/#(?:[0-9a-fA-F]{3}){1,2}\b|\brgb\(|\bhsl\(/i.test(prompt)) {
      errors.push(`Prompt ${index + 1} contains technical color notation.`);
    }
  }
  if (pack.stitching.length !== 6) errors.push("Stitching guide must cover all six clips.");
  return errors;
}

function ratioPhrase(ratio: Proposal["aspectRatio"]): string {
  if (ratio === "16:9") return "16:9 horizontal";
  if (ratio === "9:16") return "9:16 vertical";
  return "1:1 square";
}

export {
  analyzeSource,
  composePackage,
  composeScenes,
  composeVoiceover,
  exportPackageMarkdown,
};
export * from "./samples";
export * from "./types";
