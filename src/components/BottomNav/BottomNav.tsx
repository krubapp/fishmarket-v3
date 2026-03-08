"use client";

import { Icon } from "@/components/Icon";
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
  create: "duo",
  map: "home_pin",
  profile: "account_circle",
};

export function BottomNav({
  activeItem,
  onItemChange,
  className = "",
}: BottomNavProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center px-5 pt-0 ${className}`}
      style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
    >
      <nav
        className="flex w-full max-w-[410px] flex-row items-stretch justify-center gap-0 rounded-full border border-grey-200 bg-white px-6 py-5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.13)]"
        style={{ minHeight: 80 }}
        role="navigation"
        aria-label="Bottom navigation"
      >
      {BOTTOM_NAV_ITEMS.map(({ id, label, href }) => {
        const isActive = activeItem === id;
        return (
          <NextLink
            key={id}
            href={href}
            className="flex flex-1 flex-col items-center justify-center gap-1 border-none bg-transparent p-0 text-left no-underline outline-none transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.9] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            onClick={() => onItemChange?.(id)}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
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
              {label}
            </span>
          </NextLink>
        );
      })}
      </nav>
    </div>
  );
}
