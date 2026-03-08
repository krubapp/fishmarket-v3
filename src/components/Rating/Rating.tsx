"use client";

import { Icon } from "@/components/Icon";

import type { RatingProps } from "./types";

const DEFAULT_MAX = 5;

export function Rating({
  value,
  max = DEFAULT_MAX,
  onChange,
  size = 24,
  disabled = false,
  className = "",
}: RatingProps) {
  const clamped = Math.max(0, Math.min(max, Math.round(value)));
  const interactive = onChange != null && !disabled;

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`.trim()}
      role={interactive ? "group" : "img"}
      aria-label={interactive ? "Rating" : `Rating: ${clamped} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= clamped;
        const star = (
          <span
            key={i}
            className={`shrink-0 transition-transform duration-(--duration-fast) ease-(--ease-spring) text-slate-900 ${filled ? "scale-110" : "scale-100 text-grey-300"}`}
            style={{ fontSize: size }}
          >
            <Icon name="star" size={size} fill={filled ? 1 : 0} />
          </span>
        );
        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(starValue)}
              className="cursor-pointer border-0 bg-transparent p-0 outline-none transition-transform duration-(--duration-press) ease-(--ease-spring) active:scale-[0.85] focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 disabled:cursor-not-allowed"
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            >
              {star}
            </button>
          );
        }
        return star;
      })}
    </div>
  );
}
