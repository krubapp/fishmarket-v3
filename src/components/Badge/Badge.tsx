"use client";

import type { BadgeProps, BadgeVariant } from "./types";

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string }
> = {
  default: {
    bg: "bg-slate-300",
    text: "text-slate-800",
  },
  warning: {
    bg: "bg-yellow-300",
    text: "text-yellow-800",
  },
  error: {
    bg: "bg-red-300",
    text: "text-red-800",
  },
  success: {
    bg: "bg-green-300",
    text: "text-green-800",
  },
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const { bg, text } = variantStyles[variant];

  return (
    <span
      className={`inline-flex h-5 items-center justify-center gap-2.5 rounded px-3 font-medium leading-[1.43] text-[length:var(--font-size-paragraph-sm)] ${bg} ${text} ${className}`}
      role="status"
    >
      {children}
    </span>
  );
}
