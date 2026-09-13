import { describe, expect, it } from "vitest";
import {
  SAMPLE_IDEAS,
  composePackage,
  composeProposal,
  validatePackage,
  validateProposal,
} from "./index";

describe("composeProposal", () => {
  it("directs every sample into a valid six-scene English proposal", () => {
    for (const sample of SAMPLE_IDEAS) {
      const proposal = composeProposal({
        source: sample.source,
        aspectRatio: sample.aspectRatio,
        theme: sample.theme,
      });
      const errors = validateProposal(proposal);
      expect(errors, `${sample.id}: ${errors.join("; ")}`).toEqual([]);
      expect(proposal.scenes).toHaveLength(6);
      expect(proposal.voiceover).toMatch(/[A-Za-z]/);
      expect(proposal.palette).toHaveLength(3);
    }
  });

  it("keeps source facts in the gravity explainer", () => {
    const proposal = composeProposal({
      source: SAMPLE_IDEAS[0].source,
      aspectRatio: "16:9",
      theme: "dark",
    });
    const text = proposal.voiceover.toLowerCase();
    expect(text).toContain("black hole");
    expect(text).toMatch(/light/);
    expect(text).not.toMatch(/\b\d{2,}\b/);
  });

  it("recomposes staging when the aspect ratio changes", () => {
    const source = SAMPLE_IDEAS[0].source;
    const wide = composeProposal({ source, aspectRatio: "16:9", theme: "dark" });
    const tall = composeProposal({ source, aspectRatio: "9:16", theme: "dark" });
    expect(wide.composition).toMatch(/left, center, and right/i);
    expect(tall.composition).toMatch(/vertical/i);
    expect(wide.scenes[0].beats[0].action).not.toEqual(tall.scenes[0].beats[0].action);
  });

  it("inverts polarity when the theme changes", () => {
    const source = SAMPLE_IDEAS[2].source;
    const light = composeProposal({ source, aspectRatio: "1:1", theme: "light" });
    const dark = composeProposal({ source, aspectRatio: "1:1", theme: "dark" });
    expect(JSON.stringify(light.scenes)).toMatch(/pure-white canvas/i);
    expect(JSON.stringify(dark.scenes)).toMatch(/white stick figure/i);
    expect(JSON.stringify(light.scenes)).toMatch(/black stick figure/i);
  });

  it("refuses an empty source", () => {
    expect(() =>
      composeProposal({ source: "   ", aspectRatio: "9:16", theme: "dark" }),
    ).toThrow(/paste/i);
  });
});

describe("composePackage", () => {
  it("builds six standalone Omni Flash prompts after a valid proposal", () => {
    const proposal = composeProposal({
      source: SAMPLE_IDEAS[1].source,
      aspectRatio: "9:16",
      theme: "dark",
    });
    const pack = composePackage(proposal);
    expect(validatePackage(pack, proposal)).toEqual([]);
    expect(pack.prompts).toHaveLength(6);
    for (const clip of pack.prompts) {
      expect(clip.prompt).toMatch(/audio-only dialogue/i);
      expect(clip.prompt).toMatch(/9:16 vertical/);
      expect(clip.prompt).toMatch(/hollow circular head/);
      expect(clip.prompt).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(clip.prompt).toMatch(/Do not generate photorealism/);
    }
    expect(pack.stitching[0]).toMatch(/Clip 1 ends/);
  });
});
