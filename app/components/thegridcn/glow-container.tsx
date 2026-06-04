"use client";

import type * as React from "react";
import { cn } from "../ui/utils";

interface GlowContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: "lime" | "violet" | "amber" | "pink" | "cyan";
  hover?: boolean;
}

const ACCENTS = {
  lime: "hover:border-lime-400/45 hover:shadow-[0_0_28px_rgba(163,230,53,0.12)]",
  violet:
    "hover:border-violet-400/45 hover:shadow-[0_0_28px_rgba(167,139,250,0.12)]",
  amber:
    "hover:border-amber-400/45 hover:shadow-[0_0_28px_rgba(251,191,36,0.12)]",
  pink: "hover:border-pink-400/45 hover:shadow-[0_0_28px_rgba(244,114,182,0.12)]",
  cyan: "hover:border-cyan-400/45 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]",
};

export function GlowContainer({
  accent = "lime",
  children,
  className,
  hover = true,
  ...props
}: GlowContainerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/10 bg-[#121513]/95 transition-all duration-300",
        hover && ACCENTS[accent],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
