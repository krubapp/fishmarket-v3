"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";

import type { AccordionItemProps } from "./types";

export function AccordionItem({
  title,
  headerRight,
  children,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  disabled = false,
  className = "",
}: AccordionItemProps) {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = isControlled ? openProp : internalOpen;

  const handleToggle = () => {
    if (disabled) return;
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const triggerClasses =
    "flex w-full min-w-0 items-center gap-3 rounded-lg border-0 bg-transparent p-0 text-left outline-none transition-colors " +
    "hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 " +
    (disabled ? "cursor-not-allowed text-grey-700 hover:text-grey-700" : "cursor-pointer text-slate-900");

  const panelClasses =
    "flex flex-col gap-2 " +
    (disabled ? "text-grey-700" : "");

  return (
    <div
      className={`flex flex-col gap-6 rounded-lg border border-slate-200 bg-white px-6 py-6 ${disabled ? "bg-grey-200" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={open}
        aria-disabled={disabled}
        className={triggerClasses}
      >
        <span className="min-w-0 flex-1 font-semibold text-[length:var(--font-size-paragraph-lg)] leading-[1.4]">
          {title}
        </span>
        {headerRight != null && (
          <span className="flex shrink-0 items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {headerRight}
          </span>
        )}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-current transition-transform duration-(--duration-normal) ease-(--ease-out)"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <Icon name="keyboard_arrow_down" size={24} />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-(--duration-normal) ease-(--ease-out)"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        role="region"
        aria-label={title}
      >
        <div className="overflow-hidden">
          <div className={panelClasses}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
