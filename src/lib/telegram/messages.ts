import type { ProductionPackage, Proposal } from "@/lib/director";

export const TELEGRAM_TEXT_LIMIT = 4096;
export const TELEGRAM_SHARE_SAFE = 1600;

export interface TelegramClip {
  index: number;
  title: string;
  text: string;
  prompt: string;
}

export interface TelegramFormatOptions {
  prefix?: string;
}

export function composeTelegramClips(
  proposal: Proposal,
  pack: ProductionPackage,
  options: TelegramFormatOptions = {},
): TelegramClip[] {
  const prefix = normalizePrefix(options.prefix);
  return pack.prompts.map((clip, index) => {
    const prompt = clip.prompt.trim();
    const header = `Clip ${index + 1}/6 · ${clip.title} · ${proposal.aspectRatio} · ~10s · MiniMax H3 local`;
    const body = prefix ? `${prefix}\n${prompt}` : prompt;
    const text = fitTelegramMessage(`${header}\n\n${body}`, prompt, prefix);
    return {
      index: index + 1,
      title: clip.title,
      text,
      prompt,
    };
  });
}

export function telegramShareUrl(text: string, botUsername?: string | null): string | null {
  const encoded = encodeURIComponent(text);
  if (encoded.length > TELEGRAM_SHARE_SAFE) return null;
  const bot = botUsername?.replace(/^@/, "").trim();
  if (bot) return `https://t.me/${bot}?text=${encoded}`;
  return `https://t.me/share/url?url=&text=${encoded}`;
}

export function telegramBotUrl(botUsername?: string | null): string | null {
  const bot = botUsername?.replace(/^@/, "").trim();
  return bot ? `https://t.me/${bot}` : null;
}

function normalizePrefix(prefix?: string): string {
  return prefix?.trim() ?? "";
}

function fitTelegramMessage(preferred: string, prompt: string, prefix: string): string {
  if (preferred.length <= TELEGRAM_TEXT_LIMIT) return preferred;
  const fallback = prefix ? `${prefix}\n${prompt}` : prompt;
  if (fallback.length <= TELEGRAM_TEXT_LIMIT) return fallback;
  return fallback.slice(0, TELEGRAM_TEXT_LIMIT);
}
