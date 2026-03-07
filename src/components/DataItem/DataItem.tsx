"use client";

import type { DataItemProps } from "./types";

const TEXT_CLASS =
  "font-semibold text-[length:var(--font-size-paragraph-sm)] leading-[1.43]";

/**
 * Data item (Figma 32:592): label (grey-950) + value (grey-900); empty value shows "--".
 * Column layout, 4px gap, 8px vertical padding.
 */
export function DataItem({
  label,
  value,
  className = "",
}: DataItemProps) {
  const displayValue = value != null && value !== "" ? value : "--";

  return (
    <div
      className={`flex flex-col gap-1 py-2 ${className}`}
      role="listitem"
    >
      <span className={`${TEXT_CLASS} text-grey-950`}>{label}</span>
      <span className={`${TEXT_CLASS} text-grey-900`}>{displayValue}</span>
    </div>
  );
}
