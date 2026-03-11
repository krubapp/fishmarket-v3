"use client";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

import type { RootTopBarProps } from "./types";

function ActionButton({
  icon,
  label,
  onClick,
  variant = "neutral",
  active = false,
}: {
  icon: "add" | "subscriptions" | "search";
  label: string;
  onClick?: () => void;
  variant?: "neutral" | "subtle";
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none outline-none transition-[transform,background-color] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.9] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        active ? "bg-slate-900" : variant === "subtle" ? "bg-slate-100" : "bg-transparent"
      }`}
      aria-label={label}
    >
      <Icon
        name={icon}
        size={20}
        fill={1}
        className={active ? "text-white" : "text-text-default-headings"}
      />
    </button>
  );
}

export function RootTopBar({
  title,
  avatarSrc,
  onAddProduct,
  onFeed,
  onSearch,
  feedActive = false,
  className = "",
}: RootTopBarProps) {
  return (
    <header
      className={`flex h-20 w-full items-center gap-4 border-b border-slate-200 bg-white px-6 py-4 ${className}`}
      style={{
        borderBottomWidth: 1,
      }}
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
              <Icon
                name="person"
                size={20}
                className="text-grey-500"
                fill={0}
              />
            </span>
          )}
        </div>
        <span className="truncate font-medium leading-[1.4] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-lg)]">
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
        <ActionButton
          icon="subscriptions"
          label="Feed"
          onClick={onFeed}
          variant="subtle"
          active={feedActive}
        />
        <ActionButton
          icon="search"
          label="Search"
          onClick={onSearch}
        />
      </div>
    </header>
  );
}
