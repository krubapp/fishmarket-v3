"use client";

import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";
import NextLink from "next/link";

import type { TabsBoxItem, TabsBoxProps } from "./types";

const tabCellClass = (
  isLast: boolean,
  isActive: boolean,
  isDisabled: boolean
) =>
  `relative flex w-[95px] flex-col items-center gap-2 py-2 outline-none transition-[color,background-color,transform] duration-(--duration-fast) ease-(--ease-out) active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
    !isLast ? "border-r border-slate-200" : ""
  } ${
    isDisabled
      ? "cursor-not-allowed text-grey-700"
      : isActive
        ? "bg-slate-100 text-[var(--color-text-default-headings)]"
        : "text-[var(--color-text-default-headings)] hover:bg-slate-50"
  }`;

/** Single box tab (Figma Tab-Variant-box: icon, label, optional badge). Renders as link when tab.href is set. */
function TabsBoxCell({
  tab,
  isActive,
  onSelect,
  isLast,
}: {
  tab: TabsBoxItem;
  isActive: boolean;
  onSelect: () => void;
  isLast: boolean;
}) {
  const isDisabled = tab.disabled ?? false;
  const content = (
    <>
      {tab.badge != null && tab.badge !== "" && (
        <span className="absolute right-1 top-0.5">
          <Badge variant="warning">{tab.badge}</Badge>
        </span>
      )}
      <Icon
        name={tab.icon}
        size={34}
        fill={isActive ? 1 : 0}
        className={`shrink-0 ${isDisabled ? "opacity-60" : ""}`}
      />
      <span className="font-medium leading-[1.5] text-[length:var(--font-size-paragraph-md)]">
        {tab.label}
      </span>
    </>
  );

  if (tab.href != null && tab.href !== "" && !isDisabled) {
    return (
      <NextLink
        href={tab.href}
        className={tabCellClass(isLast, isActive, false)}
        aria-current={isActive ? "page" : undefined}
      >
        {content}
      </NextLink>
    );
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={onSelect}
      className={tabCellClass(isLast, isActive, isDisabled)}
    >
      {content}
    </button>
  );
}

/** Box variant of Tabs (Figma 608:1926): vertical cell per tab with icon, label, optional badge. */
export function TabsBox({
  tabs,
  value,
  onValueChange,
  className = "",
}: TabsBoxProps) {
  return (
    <div
      className={`flex flex-wrap bg-white ${className}`}
      role="tablist"
      aria-label="Tabs"
    >
      {tabs.map((tab, index) => (
        <TabsBoxCell
          key={tab.id}
          tab={tab}
          isActive={value === tab.id || value === tab.href}
          onSelect={() => !tab.disabled && onValueChange?.(tab.id)}
          isLast={index === tabs.length - 1}
        />
      ))}
    </div>
  );
}
