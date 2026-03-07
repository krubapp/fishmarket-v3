"use client";

import type { CostBreakdownProps } from "./types";

export function CostBreakdown({ rows, className = "" }: CostBreakdownProps) {
  return (
    <div
      className={`flex flex-col gap-5 border-t border-slate-200 bg-white px-6 py-2.5 ${className}`}
      role="table"
      aria-label="Cost breakdown"
    >
      {rows.map((row, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4"
          role="row"
        >
          <span
            className={
              row.highlightLabel
                ? "font-medium leading-[1.5] text-grey-950 text-[length:var(--font-size-paragraph-md)]"
                : "font-medium leading-[1.5] text-grey-500 text-[length:var(--font-size-paragraph-md)]"
            }
          >
            {row.label}
          </span>
          <span className="font-medium leading-[1.5] text-grey-500 text-[length:var(--font-size-paragraph-md)]">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
