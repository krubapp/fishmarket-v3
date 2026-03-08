"use client";

import { Icon } from "@/components/Icon";

import type { LinkProps, LinkSize } from "./types";

const sizeClass: Record<LinkSize, string> = {
  small:
    "font-medium leading-[1.43] text-[length:var(--font-size-paragraph-sm)]",
  medium:
    "font-medium leading-[1.5] text-[length:var(--font-size-paragraph-md)]",
};

const contentClass =
  "inline-flex items-center justify-center gap-3 p-1 text-slate-900 transition-[color,border-color,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97] hover:text-slate-950 border-b-2 border-transparent focus:outline-none focus:border-slate-900 disabled:pointer-events-none disabled:text-grey-700 disabled:active:scale-100";

export function Link({
  children,
  href,
  onClick,
  size = "medium",
  showIcon = true,
  disabled = false,
  className = "",
  target,
  rel,
}: LinkProps) {
  const textClass = sizeClass[size];

  const content = (
    <>
      <span className={textClass}>{children}</span>
      {showIcon && (
        <Icon
          name="chevron_right"
          size={16}
          className="shrink-0 text-current"
        />
      )}
    </>
  );

  if (href != null && href !== "" && !disabled) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`${contentClass} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`${contentClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
