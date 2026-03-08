"use client";

import type { ImageButtonProps } from "./types";

const SIZE = 100;
const RADIUS = 4;

export function ImageButton({
  src,
  alt,
  selected = false,
  onClick,
  "aria-label": ariaLabel,
  className = "",
}: ImageButtonProps) {
  return (
    <button
      type="button"
      className={`group relative inline-block shrink-0 overflow-hidden rounded-[4px] transition-[color,background-color,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.95] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
        selected ? "ring-1 ring-slate-900" : ""
      } ${className}`}
      style={{ width: SIZE, height: SIZE }}
      onClick={onClick}
      aria-label={ariaLabel ?? alt}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
      />
      {/* Hover overlay (Figma: rgba(203, 212, 201, 0.78) = grey-200 ~78%) */}
      <span
        className="absolute inset-0 bg-grey-200/80 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </button>
  );
}
