"use client";

import type * as React from "react";
import { cn } from "../ui/utils";

interface GridScanOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  gridSize?: number;
  scanSpeed?: number;
}

export function GridScanOverlay({
  className,
  gridSize = 72,
  scanSpeed = 12,
  ...props
}: GridScanOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #a3e635, #a3e635 1px, transparent 1px, transparent 4px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(#a3e635 1px, transparent 1px), linear-gradient(90deg, #a3e635 1px, transparent 1px)",
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      <div
        className="employee-scan-line absolute left-0 h-px w-full bg-lime-300/25"
        style={{ animationDuration: `${scanSpeed}s` }}
      />
    </div>
  );
}
