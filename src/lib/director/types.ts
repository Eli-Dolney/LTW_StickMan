export const ASPECT_RATIOS = ["16:9", "9:16", "1:1"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export const PATTERNS = ["motivational", "educational", "commercial"] as const;
export type Pattern = (typeof PATTERNS)[number];

export const VOICES = ["bright-female", "calm-male", "warm-female"] as const;
export type VoiceId = (typeof VOICES)[number];

export interface AccentColor {
  name: string;
  role: string;
}

export interface DirectorInput {
  source: string;
  aspectRatio: AspectRatio;
  theme: Theme;
  voice?: VoiceId;
}

export interface VisualBeat {
  range: "0–3s" | "3–7s" | "7–10s";
  action: string;
}

export interface Scene {
  index: number;
  time: string;
  title: string;
  purpose: string;
  beats: VisualBeat[];
  devices: string[];
  motion: string;
  vo: string;
  intent: string;
  audio: string;
  opening: string;
  ending: string;
}

export interface OverlayNote {
  clip: number;
  text: string;
  placement: string;
}

export interface Proposal {
  title: string;
  coreMessage: string;
  hook: string;
  aspectRatio: AspectRatio;
  theme: Theme;
  voice: VoiceId;
  narrator: string;
  wordCount: number;
  durationSeconds: number;
  palette: AccentColor[];
  bgm: string;
  tone: string;
  arc: string;
  pattern: Pattern;
  voiceover: string;
  scenes: Scene[];
  overlays: OverlayNote[];
  composition: string;
}

export interface ClipPrompt {
  title: string;
  prompt: string;
}

export interface ProductionPackage {
  continuity: string[];
  prompts: ClipPrompt[];
  stitching: string[];
  audioNote: string;
}

export interface Analysis {
  pattern: Pattern;
  topic: string;
  title: string;
  coreClaim: string;
  hook: string;
  sentences: string[];
  keywords: string[];
  numbers: string[];
  properNouns: string[];
  palette: AccentColor[];
  tone: string;
  arc: string;
  bgm: string;
  family: VisualFamily;
  hasCjk: boolean;
  sourceWords: number;
}

export type VisualFamily =
  | "space"
  | "mind"
  | "money"
  | "habit"
  | "product"
  | "educational"
  | "motivational"
  | "commercial";
