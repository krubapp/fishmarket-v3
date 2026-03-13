"use client";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";

import type { RootTopBarProps } from "./types";

/**
 * Dashboard top bar (Figma: top nav bar, types=dashboard — node 93:2260).
 * Avatar + title left; optional Sell Product text button + Search icon right.
 */
export function RootTopBar({
  title,
  avatarSrc,
  onAddProduct,
  onSearch,
  className = "",
}: RootTopBarProps) {
  return (
    <header
      className={`flex h-20 w-full items-center gap-4 border-b border-slate-200 bg-white px-6 py-4 ${className}`}
      style={{ borderBottomWidth: 1 }}
      role="banner"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-grey-200">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <Icon name="person" size={20} className="text-grey-500" fill={0} />
            </span>
          )}
        </div>
        <span className="truncate font-medium leading-[var(--line-height-paragraph-lg)] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-lg)]">
          {title}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {onAddProduct && (
          <Button
            size="small"
            variant="subtle"
            onClick={onAddProduct}
            aria-label="Sell product"
          >
            Sell Product
          </Button>
        )}
        <IconButton
          name="search"
          size="large"
          variant="transparent"
          onClick={onSearch}
          aria-label="Search"
        />
      </div>
    </header>
  );
}
