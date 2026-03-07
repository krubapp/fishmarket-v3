"use client";

import { Icon } from "@/components/Icon";
import type { MaterialSymbol } from "material-symbols";
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
    <nav
      className={`flex flex-row items-stretch justify-center gap-0 rounded-[5px] bg-white px-6 py-5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.13)] ${className}`}
      style={{ minHeight: 80 }}
      role="navigation"
      aria-label="Bottom navigation"
    >
      {BOTTOM_NAV_ITEMS.map(({ id, label }) => {
        const isActive = activeItem === id;
        return (
          <button
            key={id}
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-1 border-none bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
          </button>
        );
      })}
    </nav>
  );
}
