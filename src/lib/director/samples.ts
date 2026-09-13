import type { AspectRatio, Theme } from "./types";

export interface SampleIdea {
  id: string;
  label: string;
  blurb: string;
  source: string;
  aspectRatio: AspectRatio;
  theme: Theme;
}

export const SAMPLE_IDEAS: SampleIdea[] = [
  {
    id: "gravity",
    label: "Black holes",
    blurb: "Educational explainer",
    source:
      "Gravity bends space and time so strongly around a black hole that even light cannot escape.",
    aspectRatio: "16:9",
    theme: "dark",
  },
  {
    id: "overthinking",
    label: "Overthinking",
    blurb: "Motivational short",
    source:
      "Do you ever feel exhausted before you have even begun? Nothing has happened yet, but your mind is already carrying a hundred imaginary disasters. Before the first step, you picture failure, judgment, and rejection. Do not let overthinking ruin your life. Action does not require confidence; confidence follows action.",
    aspectRatio: "9:16",
    theme: "dark",
  },
  {
    id: "compound",
    label: "Compound interest",
    blurb: "Visual essay",
    source:
      "Compound interest is interest earned on both the original amount and the interest already added. A small regular contribution can grow into a much larger sum because each gain starts earning its own gain.",
    aspectRatio: "16:9",
    theme: "light",
  },
  {
    id: "habit-app",
    label: "Habit app",
    blurb: "Product story",
    source:
      "People abandon new habits because the first week feels empty and the streak is easy to break. A simple habit app that asks for one two-minute action and shows a clean streak can turn a shaky start into a visible path.",
    aspectRatio: "9:16",
    theme: "light",
  },
];
