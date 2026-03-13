"use client";

import { Icon } from "@/components/Icon";

import type { TrackInventoryCardProps, TrackInventoryItem } from "./types";

function ProgressBar({
  progress,
  size,
  empty,
}: {
  progress: number;
  size: "large" | "small";
  empty?: boolean;
}) {
  const height = 16;

  return (
    <div
      className="relative overflow-hidden rounded-full bg-slate-100"
      style={{
        width: size === "large" ? "100%" : "183px",
        height,
      }}
      role="progressbar"
      aria-valuenow={empty ? undefined : Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {!empty && progress > 0 && (
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-slate-900"
          style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
        />
      )}
    </div>
  );
}

function InventoryRow({
  name,
  detail,
  progress,
  size,
  empty,
}: {
  name: string;
  detail: string;
  progress: number;
  size: "large" | "small";
  empty?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-col gap-1 py-2">
        <span className="font-semibold leading-[1.43] text-grey-950 text-[length:var(--font-size-paragraph-sm)]">
          {name}
        </span>
        <span className="font-semibold leading-[1.43] text-grey-900 text-[length:var(--font-size-paragraph-sm)]">
          {detail}
        </span>
      </div>
      <ProgressBar progress={progress} size={size} empty={empty} />
    </div>
  );
}

export function TrackInventoryCard({
  title = "Track Inventory",
  subtitle = "Monitor stock in one place",
  actionLabel,
  onAction,
  items,
  className = "",
}: TrackInventoryCardProps) {
  const isEmpty = items.length === 0;
  const isSingle = items.length === 1;
  const showEmptyRow = isEmpty;

  return (
    <article
      className={`flex w-full max-w-[480px] flex-col gap-6 rounded-lg border-b border-slate-200 bg-white px-6 py-12 ${className}`}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-row items-start justify-between gap-6">
          <div className="flex flex-col gap-0">
            <h2 className="font-medium leading-[1.33] text-grey-950 text-[length:24px]">
              {title}
            </h2>
            <p className="font-normal leading-[1.5] text-grey-900 text-[length:var(--font-size-paragraph-md)]">
              {subtitle}
            </p>
          </div>
          {actionLabel != null && actionLabel !== "" && (
            <button
              type="button"
              className="flex shrink-0 items-center gap-3 rounded p-1 font-medium leading-[1.5] text-slate-900 text-[length:var(--font-size-paragraph-md)] transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              onClick={onAction}
            >
              {actionLabel}
              <Icon name="chevron_right" size={16} className="text-slate-900" />
            </button>
          )}
        </header>

        <div
          className={
            isSingle || showEmptyRow
              ? "flex flex-row gap-6"
              : "grid grid-cols-2 gap-6"
          }
        >
          {showEmptyRow ? (
            <InventoryRow
              name="Empty"
              detail="--"
              progress={0}
              size="large"
              empty
            />
          ) : isSingle ? (
            <InventoryRow
              name={items[0]!.name}
              detail={items[0]!.detail}
              progress={items[0]!.progress}
              size="large"
            />
          ) : (
            items.map((item: TrackInventoryItem, index: number) => (
              <InventoryRow
                key={index}
                name={item.name}
                detail={item.detail}
                progress={item.progress}
                size="small"
              />
            ))
          )}
        </div>
      </div>
    </article>
  );
}
