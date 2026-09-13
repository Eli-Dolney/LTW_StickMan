import { describe, expect, it } from "vitest";
import { SAMPLE_IDEAS, composePackage, composeProposal } from "@/lib/director";
import {
  TELEGRAM_TEXT_LIMIT,
  composeTelegramClips,
  telegramBotUrl,
  telegramShareUrl,
} from "./messages";

describe("composeTelegramClips", () => {
  it("builds six Telegram-ready messages from an approved package", () => {
    const proposal = composeProposal({
      source: SAMPLE_IDEAS[0].source,
      aspectRatio: "16:9",
      theme: "dark",
    });
    const pack = composePackage(proposal);
    const clips = composeTelegramClips(proposal, pack);

    expect(clips).toHaveLength(6);
    for (const [index, clip] of clips.entries()) {
      expect(clip.index).toBe(index + 1);
      expect(clip.text).toContain(pack.prompts[index].prompt);
      expect(clip.text).toMatch(/MiniMax H3 local/);
      expect(clip.text.length).toBeLessThanOrEqual(TELEGRAM_TEXT_LIMIT);
      expect(clip.text).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
  });

  it("applies an optional command prefix without dropping the prompt", () => {
    const proposal = composeProposal({
      source: SAMPLE_IDEAS[1].source,
      aspectRatio: "9:16",
      theme: "dark",
    });
    const pack = composePackage(proposal);
    const clips = composeTelegramClips(proposal, pack, { prefix: "/video" });
    expect(clips[0].text).toMatch(/^Clip 1\/6/);
    expect(clips[0].text).toContain("/video");
    expect(clips[0].text).toContain(pack.prompts[0].prompt);
  });
});

describe("telegram URLs", () => {
  it("opens a bot chat when the username is known", () => {
    expect(telegramBotUrl("@minimax_h3_bot")).toBe("https://t.me/minimax_h3_bot");
    expect(telegramShareUrl("short prompt", "minimax_h3_bot")).toBe(
      "https://t.me/minimax_h3_bot?text=short%20prompt",
    );
  });

  it("falls back to a share URL and refuses oversized links", () => {
    expect(telegramShareUrl("short prompt")).toContain("https://t.me/share/url");
    expect(telegramShareUrl("x".repeat(4000))).toBeNull();
    expect(telegramBotUrl("")).toBeNull();
  });
});
