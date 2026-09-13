"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  ClapperboardIcon,
  CopyIcon,
  DownloadIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { StickmanStage } from "@/components/stickman-stage";
import { TelegramHandoff } from "@/components/telegram-handoff";
import {
  ASPECT_RATIOS,
  SAMPLE_IDEAS,
  THEMES,
  VOICES,
  composePackage,
  composeProposal,
  exportPackageMarkdown,
  updateSceneVoiceover,
  type AspectRatio,
  type DirectorInput,
  type ProductionPackage,
  type Proposal,
  type Theme,
  type VoiceId,
} from "@/lib/director";

const VOICE_LABEL: Record<VoiceId, string> = {
  "bright-female": "Bright female",
  "calm-male": "Calm male",
  "warm-female": "Warm female",
};

const RATIO_LABEL: Record<AspectRatio, string> = {
  "16:9": "YouTube · essays",
  "9:16": "Shorts · TikTok · Reels",
  "1:1": "Feed posts",
};

export function Studio() {
  const [source, setSource] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [theme, setTheme] = useState<Theme>("dark");
  const [voice, setVoice] = useState<VoiceId>("bright-female");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [pack, setPack] = useState<ProductionPackage | null>(null);
  const [dirty, setDirty] = useState(false);
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const input: DirectorInput = useMemo(
    () => ({ source, aspectRatio, theme, voice }),
    [source, aspectRatio, theme, voice],
  );

  function markFormatChange<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      if (proposal) {
        setDirty(true);
        setPack(null);
      }
    };
  }

  function compose() {
    setComposing(true);
    setError(null);
    try {
      const next = composeProposal(input);
      setProposal(next);
      setPack(null);
      setDirty(false);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not compose a proposal.";
      setError(message);
      toast.error(message);
    } finally {
      setComposing(false);
    }
  }

  function approve() {
    if (!proposal) return;
    const next = composePackage(proposal);
    setPack(next);
    toast.success("Six standalone prompts are ready to copy.");
  }

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied.`);
    window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1600);
  }

  function downloadPackage() {
    if (!proposal || !pack) return;
    const markdown = exportPackageMarkdown(proposal, pack);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug(proposal.title)}-stickman-package.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(245,193,108,0.08),_transparent_34%),linear-gradient(180deg,_#0b0b0c,_#111113_40%,_#0b0b0c)] text-zinc-100">
      <header className="border-b border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-amber-200/80 uppercase">
              <ClapperboardIcon className="size-3.5" />
              Stickman Director
            </div>
            <h1 className="font-heading max-w-xl text-3xl leading-tight text-zinc-50 sm:text-4xl">
              Turn copy into a one-minute stickman video plan.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Paste an idea. Approve a six-scene director’s plan. Copy six Gemini Omni Flash prompts
              that already lock character, palette, voice, and transitions.
            </p>
          </div>
          <p className="max-w-xs text-xs leading-5 text-zinc-500">
            English-first studio inspired by{" "}
            <a
              className="text-amber-200 underline-offset-4 hover:underline"
              href="https://github.com/kaomei/stickman-video-director"
              target="_blank"
              rel="noreferrer"
            >
              kaomei/stickman-video-director
            </a>
            . No account. No API key. Nothing leaves this browser.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] lg:items-start sm:px-6">
        <section className="space-y-4 lg:sticky lg:top-4">
          <Card className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
            <CardHeader>
              <CardTitle>1. Source</CardTitle>
              <CardDescription className="text-zinc-400">
                A topic, notes, or a short script. The director keeps names and numbers you actually wrote.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setError(null);
                }}
                placeholder="Gravity bends space and time so strongly around a black hole that even light cannot escape."
                className="min-h-40 bg-black/40 text-zinc-100 placeholder:text-zinc-600"
              />
              <div className="flex flex-wrap gap-2">
                {SAMPLE_IDEAS.map((sample) => (
                  <Button
                    key={sample.id}
                    type="button"
                    size="sm"
                    variant={source === sample.source ? "default" : "outline"}
                    onClick={() => {
                      setSource(sample.source);
                      setAspectRatio(sample.aspectRatio);
                      setTheme(sample.theme);
                      setPack(null);
                      setDirty(Boolean(proposal));
                    }}
                  >
                    {sample.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
            <CardHeader>
              <CardTitle>2. Format</CardTitle>
              <CardDescription className="text-zinc-400">
                Visible defaults: vertical dark. Change either setting and the plan recomposes instead of renaming a label.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <fieldset className="space-y-2">
                <Label className="text-zinc-300">Aspect ratio</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => markFormatChange(setAspectRatio)(ratio)}
                      className={choiceClass(aspectRatio === ratio)}
                    >
                      <span className="font-medium text-zinc-100">{ratio}</span>
                      <span className="text-[11px] leading-4 text-zinc-500">{RATIO_LABEL[ratio]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <Label className="text-zinc-300">Theme</Label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => markFormatChange(setTheme)(option)}
                      className={choiceClass(theme === option)}
                    >
                      <span className="font-medium capitalize">{option}</span>
                      <span className="text-[11px] text-zinc-500">
                        {option === "dark" ? "Black canvas, white figure" : "White canvas, black figure"}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2">
                <Label className="text-zinc-300">Narrator</Label>
                <div className="grid grid-cols-3 gap-2">
                  {VOICES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => markFormatChange(setVoice)(option)}
                      className={choiceClass(voice === option)}
                    >
                      <span className="text-[12px] leading-4">{VOICE_LABEL[option]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              {dirty ? (
                <p className="rounded-lg bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
                  Format changed. Recompose so staging, camera paths, and polarity stay honest.
                </p>
              ) : null}
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <Button className="w-full" size="lg" onClick={compose} disabled={composing}>
                <SparklesIcon data-icon="inline-start" />
                {proposal ? "Recompose director’s plan" : "Compose director’s plan"}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          {!proposal ? (
            <EmptyWorkspace theme={theme} aspectRatio={aspectRatio} composing={composing} />
          ) : (
            <>
              <ProposalPanel
                proposal={proposal}
                dirty={dirty}
                onVoiceoverChange={(index, value) => {
                  setProposal(updateSceneVoiceover(proposal, index, value));
                  setPack(null);
                }}
                onApprove={approve}
                approved={Boolean(pack) && !dirty}
              />
              {pack ? (
                <PackagePanel
                  proposal={proposal}
                  pack={pack}
                  copied={copied}
                  onCopy={copyText}
                  onDownload={downloadPackage}
                  onReset={() => {
                    setPack(null);
                  }}
                />
              ) : null}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyWorkspace({
  theme,
  aspectRatio,
  composing,
}: {
  theme: Theme;
  aspectRatio: AspectRatio;
  composing: boolean;
}) {
  return (
    <Card className="border-white/8 bg-zinc-950/60 text-zinc-100 ring-white/10">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Workspace</CardTitle>
          <CardDescription className="max-w-xl text-zinc-400">
            A script is not yet a video. This studio writes the hook, six scenes, the English
            voiceover, and the production locks before you spend a generation credit.
          </CardDescription>
        </div>
        <Badge variant="outline">Paste → choose → approve → generate</Badge>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <StickmanStage theme={theme} aspectRatio={aspectRatio} moving={composing} />
        <ol className="space-y-4 text-sm leading-6 text-zinc-300">
          <li>
            <strong className="text-zinc-100">Paste.</strong> A topic is enough. Long copy is
            compressed to one claim. Facts you did not write are not invented.
          </li>
          <li>
            <strong className="text-zinc-100">Choose.</strong> 9:16 / 16:9 / 1:1 and light or dark.
            Staging changes with the frame, not just the ratio label.
          </li>
          <li>
            <strong className="text-zinc-100">Approve.</strong> Read the six-scene plan and the
            130–150 word voiceover. Edit a line if you want. Then generate prompts.
          </li>
          <li>
            <strong className="text-zinc-100">Stitch.</strong> Each prompt is a ~10s Gemini Omni Flash
            clip. The stitching guide matches endings to openings.
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}

function ProposalPanel({
  proposal,
  dirty,
  approved,
  onVoiceoverChange,
  onApprove,
}: {
  proposal: Proposal;
  dirty: boolean;
  approved: boolean;
  onVoiceoverChange: (index: number, value: string) => void;
  onApprove: () => void;
}) {
  const wordTone =
    proposal.wordCount >= 130 && proposal.wordCount <= 150 ? "text-emerald-300" : "text-amber-200";

  return (
    <div className="space-y-4">
      <Card className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{proposal.pattern}</Badge>
            <Badge variant="outline">{proposal.aspectRatio}</Badge>
            <Badge variant="outline">{proposal.theme}</Badge>
            <Badge variant="outline" className={wordTone}>
              {proposal.wordCount} words · ~{Math.round(proposal.durationSeconds)}s
            </Badge>
          </div>
          <CardTitle className="font-heading text-3xl">{proposal.title}</CardTitle>
          <CardDescription className="text-zinc-400">
            <span className="text-zinc-200">Hook.</span> {proposal.hook}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-zinc-300 md:grid-cols-2">
          <p>
            <span className="text-zinc-500">Core message.</span> {proposal.coreMessage}
          </p>
          <p>
            <span className="text-zinc-500">Narrator.</span> {proposal.narrator}. {proposal.tone}.
          </p>
          <p>
            <span className="text-zinc-500">Arc.</span> {proposal.arc}
          </p>
          <p>
            <span className="text-zinc-500">BGM.</span> {proposal.bgm}
          </p>
          <div className="md:col-span-2">
            <span className="text-zinc-500">Palette.</span>{" "}
            {proposal.palette.map((color) => `${color.name} (${color.role})`).join(" · ")}
          </div>
          <p className="md:col-span-2">
            <span className="text-zinc-500">Composition.</span> {proposal.composition}
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
        <CardHeader>
          <CardTitle>English voiceover</CardTitle>
          <CardDescription className="text-zinc-400">
            Six spoken beats, about 18–25 words each. Edit a line if the voice should land differently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl bg-black/40 p-4 text-sm leading-7 text-zinc-200">{proposal.voiceover}</p>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {proposal.scenes.map((scene) => (
          <Card key={scene.index} className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-lg">
                  Clip {scene.index} · {scene.title}
                </CardTitle>
                <Badge variant="outline">{scene.time}</Badge>
              </div>
              <CardDescription className="text-zinc-400">{scene.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ol className="space-y-2 text-zinc-300">
                {scene.beats.map((beat) => (
                  <li key={beat.range}>
                    <span className="font-mono text-amber-200/80">{beat.range}</span> {beat.action}
                  </li>
                ))}
              </ol>
              <p className="text-zinc-500">{scene.intent}</p>
              <p className="text-zinc-400">
                <span className="text-zinc-500">Handoff.</span> {scene.opening} → {scene.ending}
              </p>
              <Label htmlFor={`vo-${scene.index}`} className="text-zinc-300">
                Spoken line
              </Label>
              <Textarea
                id={`vo-${scene.index}`}
                value={scene.vo}
                onChange={(event) => onVoiceoverChange(scene.index, event.target.value)}
                className="min-h-20 bg-black/40"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
        <CardHeader>
          <CardTitle>Post-production overlays</CardTitle>
          <CardDescription className="text-zinc-400">
            Optional two-to-five-word titles for the edit. They are never sent to the video model.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {proposal.overlays.map((overlay) => (
            <Badge key={`${overlay.clip}-${overlay.text}`} variant="secondary">
              Clip {overlay.clip}: {overlay.text}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 rounded-xl border border-amber-200/20 bg-amber-200/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-300">
          {dirty
            ? "Recompose the plan before generating prompts."
            : approved
              ? "This plan is approved. Scroll for the production package."
              : "Approve this plan to generate six standalone Omni Flash prompts."}
        </p>
        <Button size="lg" onClick={onApprove} disabled={dirty}>
          <CheckIcon data-icon="inline-start" />
          Approve and generate prompts
        </Button>
      </div>
    </div>
  );
}

function PackagePanel({
  proposal,
  pack,
  copied,
  onCopy,
  onDownload,
  onReset,
}: {
  proposal: Proposal;
  pack: ProductionPackage;
  copied: string | null;
  onCopy: (label: string, text: string) => void;
  onDownload: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Production package</CardTitle>
            <CardDescription className="text-zinc-400">
              Each prompt repeats the locks. Generate the six clips separately, then stitch.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                onCopy("Full package", exportPackageMarkdown(proposal, pack))
              }
            >
              {copied === "Full package" ? <CheckIcon /> : <CopyIcon />}
              Copy all
            </Button>
            <Button variant="outline" onClick={onDownload}>
              <DownloadIcon />
              Download markdown
            </Button>
            <Button variant="ghost" onClick={onReset}>
              <RotateCcwIcon />
              Hide prompts
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          <ul className="list-disc space-y-1 pl-5">
            {pack.continuity.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <Separator />
          <div>
            <p className="mb-2 text-zinc-500">Stitching</p>
            <ol className="list-decimal space-y-1 pl-5">
              {pack.stitching.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
          <p className="text-zinc-500">{pack.audioNote}</p>
        </CardContent>
      </Card>

      <TelegramHandoff proposal={proposal} pack={pack} />

      {pack.prompts.map((clip, index) => (
        <Card key={clip.title} className="border-white/8 bg-zinc-950/70 text-zinc-100 ring-white/10">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <CardTitle>
              Clip {index + 1} · {clip.title}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => onCopy(`Clip ${index + 1}`, clip.prompt)}>
              {copied === `Clip ${index + 1}` ? <CheckIcon /> : <CopyIcon />}
              Copy prompt
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 text-xs leading-6 whitespace-pre-wrap text-zinc-300">
              {clip.prompt}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function choiceClass(active: boolean) {
  return [
    "flex min-h-16 flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors",
    active
      ? "border-amber-200/40 bg-amber-200/10"
      : "border-white/10 bg-black/20 hover:border-white/20",
  ].join(" ");
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
