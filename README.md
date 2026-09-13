# Stickman Director

Turn any English idea into a one-minute stickman video plan: a confirmed six-scene director’s proposal and six standalone [Gemini Omni Flash](https://ai.google.dev/) prompts.

This is an English-first studio inspired by [kaomei/stickman-video-director](https://github.com/kaomei/stickman-video-director). The original is a Codex skill with a conversational setup gate. This clone keeps the production contracts — 130–150 word English voiceover, three timed beats per clip, character locks, palette limits, approval before prompts — and makes the path visible: paste, choose, approve, copy.

No account. No API key. The director runs locally in the browser.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

```bash
npm test    # director engine checks
npm run build
```

## How it works

1. **Paste** a topic, notes, or a short script.
2. **Choose** `9:16`, `16:9`, or `1:1`, then light or dark. Vertical dark is the default because most people are cutting Shorts, TikTok, or Reels.
3. **Approve** the six-scene plan. Edit a spoken line if you want. Changing ratio or theme recomposes staging instead of swapping a label.
4. **Copy** six self-contained Omni Flash prompts, plus a stitching guide.
5. **Send to MiniMax** as six Telegram-ready clip messages for a local H3 bot, or copy / open Telegram if no bot token is configured.
6. **Stitch** the six ~10-second clips into one minute.

The studio does not call Gemini, MiniMax cloud, or any paid video API. It does the production thinking, then hands clips to your existing local Telegram bot.

## MiniMax H3 via Telegram

After you approve a plan, **Generate / send to MiniMax** builds one Telegram message per clip. That is the free local route: your MiniMax H3 bot on the 4080 PC.

Copy the env example and fill only what you have:

```bash
cp .env.example .env.local
```

- `TELEGRAM_WEBHOOK_URL` — preferred. POST the six messages to a local bot/webhook on the PC.
- `TELEGRAM_BOT_TOKEN` + `CHAT_ID` — optional. Send the messages into a Telegram chat (free Bot API, not MiniMax cloud).
- `NEXT_PUBLIC_TELEGRAM_BOT` — optional bot username for “Open bot”. Unknown until you paste it.
- `NEXT_PUBLIC_TELEGRAM_PREFIX` — optional command prefix (for example `/video`) once we see a sample message.

Without those variables, every clip still has **Copy message** and **Open Telegram**. The Omni Flash copy/download path is unchanged.

## What is better than the original

- English UI, English docs, English scene intent — no Chinese-only labels.
- A visual studio instead of a skill you have to install into Codex.
- Recommended defaults you can see and change, instead of a blocking “please choose.”
- One-click copy and a markdown download for the full package.
- Sample ideas so the first run is not a blank page.
- Telegram handoff to a local MiniMax H3 bot, with copy fallback if env is empty.

## Credit

Core directing rules, prompt locks, and the six-clip Omni Flash package come from [kaomei/stickman-video-director](https://github.com/kaomei/stickman-video-director) (MIT). This repository is a separate English studio, not the original project.

## License

MIT
