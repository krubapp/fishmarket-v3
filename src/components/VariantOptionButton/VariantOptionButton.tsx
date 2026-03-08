"use client";

import type { VariantOptionButtonProps } from "./types";

/**
 * Variant option button (Figma: variant-Option-Button, node 535:1510).
 * States: default, hover, focus, selected. 4px radius, 16px 32px padding, 2px border, body/body-md.
 */
export function VariantOptionButton({
  children,
  selected = false,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
  className = "",
}: VariantOptionButtonProps) {
  return (
    <button
      type="button"
      className={`
        inline-flex min-w-[130px] items-center justify-center rounded-[4px] border-2 py-4 px-8
        font-normal text-[length:var(--font-size-paragraph-md)] leading-[1.5]
        transition-[color,background-color,border-color,transform] duration-(--duration-press) ease-(--ease-spring)
        active:scale-[0.97]
        focus:outline-none focus:border-slate-900
        disabled:pointer-events-none disabled:active:scale-100
        ${
          selected
            ? "border-slate-200 bg-grey-200 text-grey-700"
            : "border-slate-400 bg-slate-100 text-slate-900 hover:border-slate-500 hover:bg-slate-200 hover:text-slate-950 focus:border-slate-900"
        }
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
