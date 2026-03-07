"use client";

import type { BorderLineProps } from "./types";

/**
 * Border line (Figma 470:1703): 2px horizontal divider, slate-200.
 */
export function BorderLine({ className = "" }: BorderLineProps) {
  return (
    <div
      className={`h-[2px] w-full bg-slate-200 ${className}`}
      role="separator"
      aria-hidden
    />
  );
}
