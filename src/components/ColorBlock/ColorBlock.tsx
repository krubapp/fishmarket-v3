"use client";

import type { ColorBlockColor, ColorBlockProps } from "./types";

const colorToBg: Record<ColorBlockColor, string> = {
  white: "#F1F5F9",
  red: "#FD4F4F",
  green: "#72CA58",
  black: "#030712",
  silver: "#99A1AF",
  yellow: "#FBBF25",
  blue: "#0981B8",
};

export function ColorBlock({
  color = "green",
  label,
  selected = false,
  className = "",
}: ColorBlockProps) {
  const hasLabel = label != null && label !== "";
  const bg = colorToBg[color];

  const block = (
    <span
      className={`block h-6 w-6 shrink-0 rounded-[2px] ${selected ? "ring-2 ring-[#101828] ring-inset" : ""}`}
      style={{ backgroundColor: bg }}
      aria-hidden
    />
  );

  if (hasLabel) {
    return (
      <div
        className={`flex flex-col items-center gap-2 p-2 ${className}`}
        role="img"
        aria-label={label}
      >
        {block}
        <span className="text-center font-medium leading-[1.43] text-grey-900 text-[length:var(--font-size-paragraph-sm)]">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={className} role="img" aria-label={label ?? color}>
      {block}
    </div>
  );
}
