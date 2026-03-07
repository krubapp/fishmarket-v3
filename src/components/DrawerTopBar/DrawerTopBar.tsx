"use client";

import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";

import type { DrawerTopBarProps } from "./types";

/**
 * Drawer top bar (Figma 322:5273): back button, center title, optional action button.
 * Padding 16px 24px, bottom border 1px slate-200, rounded top corners 34px.
 */
export function DrawerTopBar({
  title,
  onBack,
  actionLabel,
  onAction,
  actionIcon,
  backAriaLabel = "Back",
  className = "",
}: DrawerTopBarProps) {
  return (
    <header
      className={`flex shrink-0 flex-row items-center justify-between gap-4 rounded-t-[34px] border-b border-slate-200 bg-white px-6 py-4 ${className}`}
      role="banner"
    >
      <div className="flex shrink-0">
        <IconButton
          name="chevron_left"
          size="large"
          variant="subtle"
          aria-label={backAriaLabel}
          onClick={onBack}
        />
      </div>
      <h2 className="min-w-0 flex-1 truncate text-center font-semibold text-grey-900 text-[length:var(--font-size-paragraph-md)] leading-[1.5]">
        {title}
      </h2>
      <div className="flex shrink-0 justify-end">
        {actionLabel != null && onAction != null ? (
          <Button
            size="small"
            variant="subtle"
            trailingIcon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : (
          <span className="w-10" aria-hidden />
        )}
      </div>
    </header>
  );
}
