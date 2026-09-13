export type TelegramSendMode = "webhook" | "bot" | "none";

export interface TelegramPublicStatus {
  configured: boolean;
  mode: TelegramSendMode;
  botUsername: string | null;
  prefix: string;
}

export interface TelegramRuntimeConfig extends TelegramPublicStatus {
  token: string | null;
  chatId: string | null;
  webhook: string | null;
}

export function readTelegramConfig(): TelegramRuntimeConfig {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? process.env.CHAT_ID)?.trim() || null;
  const webhook = process.env.TELEGRAM_WEBHOOK_URL?.trim() || null;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT?.replace(/^@/, "").trim() || null;
  const prefix = process.env.NEXT_PUBLIC_TELEGRAM_PREFIX?.trim() ?? "";

  if (webhook) {
    return {
      configured: true,
      mode: "webhook",
      botUsername,
      prefix,
      token,
      chatId,
      webhook,
    };
  }

  if (token && chatId) {
    return {
      configured: true,
      mode: "bot",
      botUsername,
      prefix,
      token,
      chatId,
      webhook,
    };
  }

  return {
    configured: false,
    mode: "none",
    botUsername,
    prefix,
    token,
    chatId,
    webhook,
  };
}

export function publicTelegramStatus(config: TelegramRuntimeConfig): TelegramPublicStatus {
  return {
    configured: config.configured,
    mode: config.mode,
    botUsername: config.botUsername,
    prefix: config.prefix,
  };
}
