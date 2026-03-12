"use client";

import { Icon } from "@/components/Icon";
import { useAuth } from "@/hooks/useAuth";
import type { MaterialSymbol } from "material-symbols";
import NextLink from "next/link";
import {
  BOTTOM_NAV_ITEMS,
  type BottomNavItemId,
  type BottomNavProps,
} from "./types";

const ITEM_ICONS: Record<BottomNavItemId, MaterialSymbol> = {
  home: "home",
  shop: "local_mall",
  add_video: "duo",
  feed: "play_circle",
  profile: "account_circle",
};

export function BottomNav({
  activeItem,
  onItemChange,
  className = "",
}: BottomNavProps) {
  const { profile } = useAuth();
  const homeLabel = profile?.isSeller ? "Dashboard" : "Home";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] ${className}`}
    >
      <nav
        className="flex w-full flex-row items-stretch justify-center gap-0 border-t border-grey-200 px-4 py-3"
        role="navigation"
        aria-label="Bottom navigation"
      >
      {BOTTOM_NAV_ITEMS.map(({ id, label, href }) => {
        const displayLabel = id === "home" ? homeLabel : label;
        const isActive = activeItem === id;
        return (
          <NextLink
            key={id}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 border-none bg-transparent p-0 text-left no-underline outline-none transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.9] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            onClick={() => onItemChange?.(id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={displayLabel}
          >
            <Icon
              name={ITEM_ICONS[id]}
              size={24}
              fill={isActive ? 1 : 0}
              className={
                isActive
                  ? "text-[var(--color-text-default-headings)]"
                  : "text-grey-700"
              }
            />
            <span
              className={`text-caption font-semibold leading-[1.333] ${
                isActive
                  ? "text-[var(--color-text-default-headings)]"
                  : "text-grey-700"
              }`}
            >
              {displayLabel}
            </span>
          </NextLink>
        );
      })}
      </nav>
    </div>
  );
}
