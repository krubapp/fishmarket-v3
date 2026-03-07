"use client";

import type { ProgressBarProps, ProgressBarSize } from "./types";

const SIZE_HEIGHT: Record<ProgressBarSize, number> = {
  small: 8,
  large: 16,
};

/**
 * Progress bar (Figma 32:656): track slate-100, fill slate-900.
 * Value 0–max; default max=1 for 0–1 progress.
 */
export function ProgressBar({
  value,
  max = 1,
  size = "large",
  "aria-label": ariaLabel,
  className = "",
}: ProgressBarProps) {
  const height = SIZE_HEIGHT[size];
  const safeMax = max <= 0 ? 1 : max;
  const clamped = Math.min(Math.max(Number(value), 0), safeMax);
  const percent = (clamped / safeMax) * 100;

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-slate-100 ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={ariaLabel}
    >
      <div
        className="h-full rounded-full bg-slate-900 transition-[width] duration-200 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
