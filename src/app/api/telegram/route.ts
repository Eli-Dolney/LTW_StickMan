import { publicTelegramStatus, readTelegramConfig } from "@/lib/telegram/config";
import type { TelegramClip } from "@/lib/telegram/messages";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(publicTelegramStatus(readTelegramConfig()));
}

export async function POST(request: Request) {
  const config = readTelegramConfig();
  if (!config.configured) {
    return Response.json(
      {
        ok: false,
        configured: false,
        error: "No TELEGRAM_WEBHOOK_URL or TELEGRAM_BOT_TOKEN + CHAT_ID in env. Copy or open Telegram instead.",
      },
      { status: 412 },
    );
  }

  let body: { clips?: TelegramClip[]; clip?: TelegramClip };
  try {
    body = (await request.json()) as { clips?: TelegramClip[]; clip?: TelegramClip };
  } catch {
    return Response.json({ ok: false, error: "Expected JSON with clip or clips." }, { status: 400 });
  }

  const clips = (body.clips ?? (body.clip ? [body.clip] : [])).filter((clip) => clip?.text?.trim());
  if (clips.length === 0) {
    return Response.json({ ok: false, error: "No Telegram clip text to send." }, { status: 400 });
  }

  try {
    if (config.mode === "webhook" && config.webhook) {
      await sendWebhook(config.webhook, clips);
    } else if (config.mode === "bot" && config.token && config.chatId) {
      await sendBotMessages(config.token, config.chatId, clips);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telegram send failed.";
    return Response.json({ ok: false, configured: true, error: message }, { status: 502 });
  }

  return Response.json({ ok: true, configured: true, mode: config.mode, sent: clips.length });
}

async function sendWebhook(url: string, clips: TelegramClip[]) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      source: "stickman-director",
      text: clips.length === 1 ? clips[0].text : undefined,
      clip: clips.length === 1 ? clips[0] : undefined,
      clips,
    }),
  });
  if (!response.ok) {
    throw new Error(`Local webhook returned ${response.status}.`);
  }
}

async function sendBotMessages(token: string, chatId: string, clips: TelegramClip[]) {
  for (const [index, clip] of clips.entries()) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: clip.text,
        disable_web_page_preview: true,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Telegram sendMessage failed for clip ${clip.index}: ${detail.slice(0, 180)}`);
    }
    if (index < clips.length - 1) {
      await sleep(400);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
