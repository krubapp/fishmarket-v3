"use client";

import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";

import type { ContextTopBarProps } from "./types";

/**
 * Context top bar (Figma: top nav bar, types=pages 93:2262, types=Shopping 496:658).
 * Back + label left; center title; optional share, filter, search icon buttons right.
 */
export function ContextTopBar({
  backLabel,
  title,
  onBack,
  onShare,
  onFilter,
  onSearch,
  className = "",
  hidePadding = false,
}: ContextTopBarProps) {
  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 flex h-20 w-full items-center gap-4 border-b border-slate-200 bg-white px-6 py-4 ${className}`}
        style={{ borderBottomWidth: 1 }}
        role="banner"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="relative z-10 flex min-w-0 shrink-0 items-center gap-2 rounded-full border-none bg-transparent py-2 pr-2 pl-1 outline-none transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.9] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label={backLabel !== undefined ? `Back to ${backLabel}` : "Back"}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
              <Icon
                name="chevron_left"
                size={24}
                className="text-[var(--color-text-default-headings)]"
              />
            </span>
            {backLabel !== undefined && (
              <span className="whitespace-nowrap font-medium leading-[var(--line-height-paragraph-md)] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-md)]">
                {backLabel}
              </span>
            )}
          </button>
        )}

        <h1 className="pointer-events-none absolute inset-0 flex items-center justify-center truncate px-6 font-semibold leading-[var(--line-height-paragraph-md)] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-md)]">
          {title}
        </h1>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-4">
          {onShare && (
            <IconButton
              name="share"
              size="large"
              variant="neutrals"
              onClick={onShare}
              aria-label="Share"
            />
          )}
          {onFilter && (
            <IconButton
              name="tune"
              size="large"
              variant="neutrals"
              onClick={onFilter}
              aria-label="Filter"
            />
          )}
          {onSearch && (
            <IconButton
              name="search"
              size="large"
              variant="neutrals"
              onClick={onSearch}
              aria-label="Search"
            />
          )}
        </div>
      </header>
      {!hidePadding && <div className="h-20" />}
    </>
  );
}
