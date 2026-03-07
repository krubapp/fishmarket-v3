"use client";

import type { SectionLineProps } from "./types";

/**
 * Section line (Figma 410:9145): 8px horizontal bar, slate-100.
 */
export function SectionLine({ className = "" }: SectionLineProps) {
  return (
    <div
      className={`h-2 w-full bg-slate-100 ${className}`}
      role="separator"
      aria-hidden
    />
  );
}
