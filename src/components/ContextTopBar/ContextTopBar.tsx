"use client";

import { Icon } from "@/components/Icon";

import type { ContextTopBarProps } from "./types";

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: "tune" | "search";
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={label}
    >
      <Icon
        name={icon}
        size={20}
        className="text-[var(--color-text-default-headings)]"
      />
    </button>
  );
}

export function ContextTopBar({
  backLabel,
  title,
  onBack,
  onFilter,
  onSearch,
  className = "",
}: ContextTopBarProps) {
  return (
    <header
      className={`flex h-20 w-full items-center justify-center gap-4 border-b border-slate-200 bg-white px-6 py-4 ${className}`}
      style={{ borderBottomWidth: 1 }}
      role="banner"
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label={`Back to ${backLabel}`}
        >
          <Icon
            name="arrow_back"
            size={24}
            className="text-[var(--color-text-default-headings)]"
          />
        </button>
        <span className="whitespace-nowrap font-medium leading-[1.43] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-sm)]">
          {backLabel}
        </span>
      </div>

      <h1 className="min-w-0 flex-1 truncate text-center font-semibold leading-[1.5] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-md)]">
        {title}
      </h1>

      <div className="flex shrink-0 items-center gap-4">
        <ActionButton icon="tune" label="Filter" onClick={onFilter} />
        <ActionButton icon="search" label="Search" onClick={onSearch} />
      </div>
    </header>
  );
}
