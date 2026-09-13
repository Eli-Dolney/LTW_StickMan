"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, ExternalLinkIcon, SendIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductionPackage, Proposal } from "@/lib/director";
import type { TelegramPublicStatus } from "@/lib/telegram/config";
import {
  composeTelegramClips,
  telegramBotUrl,
  telegramShareUrl,
  type TelegramClip,
} from "@/lib/telegram/messages";

export function TelegramHandoff({
  proposal,
  pack,
}: {
  proposal: Proposal;
  pack: ProductionPackage;
}) {
  const [status, setStatus] = useState<TelegramPublicStatus | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const clips = useMemo(
    () => composeTelegramClips(proposal, pack, { prefix: status?.prefix }),
    [proposal, pack, status?.prefix],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/telegram", { cache: "no-store" })
      .then((response) => response.json() as Promise<TelegramPublicStatus>)
      .then((next) => {
        if (!cancelled) setStatus(next);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({ configured: false, mode: "none", botUsername: null, prefix: "" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied.`);
    window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1600);
  }

  function openTelegram(clip: TelegramClip) {
    const share = telegramShareUrl(clip.text, status?.botUsername);
    const bot = telegramBotUrl(status?.botUsername);
    if (share) {
      window.open(share, "_blank", "noopener,noreferrer");
      return;
    }
    void copyText(`Telegram clip ${clip.index}`, clip.text);
    if (bot) {
      window.open(bot, "_blank", "noopener,noreferrer");
      toast.message("Prompt is too long for a Telegram link. It is copied — paste it into the bot.");
      return;
    }
    toast.message("Prompt is too long for a Telegram link. It is copied — paste it into your MiniMax bot.");
  }

  async function sendClips(selection: TelegramClip[], label: string) {
    setSending(label);
    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(selection.length === 1 ? { clip: selection[0] } : { clips: selection }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; configured?: boolean };
      if (response.status === 412 || payload.configured === false) {
        await copyText(label, selection.map((clip) => clip.text).join("\n\n---\n\n"));
        toast.message("No Telegram send env. Messages copied — paste them into the MiniMax bot.");
        return;
      }
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Send failed.");
      }
      toast.success(
        selection.length === 1
          ? `Clip ${selection[0].index} sent to the local MiniMax route.`
          : `${selection.length} clip messages sent to the local MiniMax route.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send to Telegram.");
    } finally {
      setSending(null);
    }
  }

  const ready = Boolean(status?.configured);
  const bot = telegramBotUrl(status?.botUsername);

  return (
    <Card className="border-amber-200/20 bg-zinc-950/70 text-zinc-100 ring-amber-200/15">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">MiniMax H3 · local</Badge>
          <Badge variant="outline">
            {ready
              ? status?.mode === "webhook"
                ? "Auto-send via local webhook"
                : "Auto-send via Telegram chat"
              : "Copy or open Telegram"}
          </Badge>
        </div>
        <CardTitle>Generate / send to MiniMax</CardTitle>
        <CardDescription className="text-zinc-400">
          Six Telegram-ready clip messages for your MiniMax H3 bot on the 4080. This studio does not
          call Gemini, MiniMax cloud, or any paid video API. Bot username and exact command format
          can be steered once you paste a sample.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => sendClips(clips, "All Telegram clips")}
            disabled={sending !== null}
          >
            <SendIcon data-icon="inline-start" />
            {sending === "All Telegram clips" ? "Sending…" : ready ? "Send all six" : "Copy all six"}
          </Button>
          <Button
            variant="outline"
            onClick={() => copyText("All Telegram clips", clips.map((clip) => clip.text).join("\n\n---\n\n"))}
          >
            {copied === "All Telegram clips" ? <CheckIcon /> : <CopyIcon />}
            Copy all Telegram messages
          </Button>
          {bot ? (
            <Button
              variant="outline"
              onClick={() => window.open(bot, "_blank", "noopener,noreferrer")}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              Open bot
            </Button>
          ) : null}
        </div>
        <ol className="space-y-3">
          {clips.map((clip) => (
            <li
              key={clip.index}
              className="rounded-xl border border-white/8 bg-black/30 p-3 text-sm"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-zinc-100">
                  Clip {clip.index} · {clip.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(`Telegram clip ${clip.index}`, clip.text)}
                  >
                    {copied === `Telegram clip ${clip.index}` ? <CheckIcon /> : <CopyIcon />}
                    Copy message
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openTelegram(clip)}>
                    <ExternalLinkIcon />
                    Open Telegram
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendClips([clip], `Telegram clip ${clip.index}`)}
                    disabled={sending !== null}
                  >
                    <SendIcon />
                    {ready ? "Send" : "Copy + ready"}
                  </Button>
                </div>
              </div>
              <pre className="max-h-40 overflow-auto text-xs leading-5 whitespace-pre-wrap text-zinc-400">
                {clip.text}
              </pre>
            </li>
          ))}
        </ol>
        <p className="text-xs leading-5 text-zinc-500">
          Auto-send uses <code className="text-zinc-400">TELEGRAM_WEBHOOK_URL</code> or{" "}
          <code className="text-zinc-400">TELEGRAM_BOT_TOKEN</code> +{" "}
          <code className="text-zinc-400">CHAT_ID</code>. Without those, every button still copies
          or opens Telegram.
        </p>
      </CardContent>
    </Card>
  );
}
