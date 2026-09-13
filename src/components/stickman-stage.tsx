"use client";

import { cn } from "@/lib/utils";
import type { AspectRatio, Theme } from "@/lib/director";

const RATIO_CLASS: Record<AspectRatio, string> = {
  "16:9": "aspect-video w-full",
  "9:16": "aspect-[9/16] h-[min(420px,58vh)] w-auto",
  "1:1": "aspect-square w-full max-w-[360px]",
};

export function StickmanStage({
  theme,
  aspectRatio,
  moving = false,
  className,
}: {
  theme: Theme;
  aspectRatio: AspectRatio;
  moving?: boolean;
  className?: string;
}) {
  const light = theme === "light";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl ring-1 ring-foreground/10",
        RATIO_CLASS[aspectRatio],
        light ? "bg-white" : "bg-black",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-40",
          light
            ? "bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-size-[28px_28px]"
            : "bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-size-[28px_28px]",
        )}
      />
      <svg
        viewBox="0 0 200 200"
        className={cn("absolute inset-0 h-full w-full", moving && "motion-safe:animate-pulse")}
        aria-hidden
      >
        <g
          className={cn(
            "origin-center",
            moving ? "motion-safe:animate-[walk_1.1s_ease-in-out_infinite]" : "motion-safe:animate-[idle_2.4s_ease-in-out_infinite]",
          )}
          stroke={light ? "#111" : "#f5f5f4"}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        >
          <circle cx="100" cy="48" r="16" />
          <line x1="100" y1="64" x2="100" y2="118" />
          <line x1="100" y1="78" x2="72" y2="102" />
          <line x1="100" y1="78" x2="132" y2="94" />
          <line x1="100" y1="118" x2="78" y2="156" />
          <line x1="100" y1="118" x2="124" y2="156" />
        </g>
        <circle
          cx="148"
          cy="58"
          r="5"
          className={moving ? "motion-safe:animate-ping" : ""}
          fill={light ? "#2563eb" : "#f5c16c"}
        />
      </svg>
      <p
        className={cn(
          "absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.18em] uppercase",
          light ? "text-neutral-500" : "text-neutral-400",
        )}
      >
        {aspectRatio} · {light ? "white canvas" : "black canvas"}
      </p>
    </div>
  );
}
