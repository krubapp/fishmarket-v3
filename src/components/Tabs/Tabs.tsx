"use client";

import { Icon } from "@/components/Icon";

import type { TabItem, TabsProps } from "./types";

/** Single tab (Figma: Status=rest | hover | active | focus | disable). */
function TabButton({
  tab,
  isActive,
  onSelect,
}: {
  tab: TabItem;
  isActive: boolean;
  onSelect: () => void;
}) {
  const isDisabled = tab.disabled;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={onSelect}
      className={`flex flex-col items-center justify-center gap-1 px-4 py-2 outline-none transition-[color,transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
        isDisabled
          ? "cursor-not-allowed text-grey-700"
          : isActive
            ? "text-[var(--color-text-default-headings)]"
            : "text-grey-500 hover:text-slate-950"
      }`}
    >
      {/* Label + optional icon (Frame 1/2) */}
      <span className="flex items-center gap-2">
        <span className="font-semibold leading-[1.5] text-[length:var(--font-size-paragraph-md)]">
          {tab.label}
        </span>
        {tab.icon != null && (
          <Icon
            name={tab.icon}
            size={24}
            fill={isActive ? 1 : 0}
            className={`shrink-0 ${isDisabled ? "opacity-60" : ""}`}
          />
        )}
      </span>
      {/* Underline: 2px bar with color transition */}
      <span
        className={`h-0.5 w-full rounded-full transition-[background-color] duration-(--duration-fast) ease-(--ease-out) ${
          isDisabled
            ? "bg-slate-200"
            : isActive
              ? "bg-[var(--color-text-default-headings)]"
              : "bg-transparent"
        }`}
        aria-hidden
      />
    </button>
  );
}

export function Tabs({
  tabs,
  value,
  onValueChange,
  className = "",
}: TabsProps) {
  return (
    <div
      className={`flex flex-wrap gap-0 bg-white ${className}`}
      role="tablist"
      aria-label="Tabs"
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={value === tab.id}
          onSelect={() => !tab.disabled && onValueChange(tab.id)}
        />
      ))}
    </div>
  );
}
