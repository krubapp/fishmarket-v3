"use client";

import { ImageBlock } from "@/components/ImageBlock";
import { Icon } from "@/components/Icon";

import type { ListingItemProps } from "./types";

export function ListingItem({
  imageSrc,
  title,
  subtitle,
  onClick,
  className = "",
}: ListingItemProps) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-4 bg-white p-4 text-left ${className}`}
      onClick={onClick}
    >
      <ImageBlock size="small" src={imageSrc ?? null} rounded />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-semibold text-text-default-headings text-paragraph-lg leading-(--line-height-paragraph-lg)">
          {title}
        </span>
        {subtitle && (
          <span className="font-medium text-text-default-caption text-paragraph-sm leading-(--line-height-paragraph-sm)">
            {subtitle}
          </span>
        )}
      </div>
      <Icon name="chevron_right" size={24} className="shrink-0 text-grey-900" />
    </button>
  );
}
