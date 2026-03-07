"use client";

import type { BannerProps } from "./types";

export function Banner({ title, description, icon, className = "" }: BannerProps) {
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-lg bg-yellow-100 px-6 py-6 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      {icon != null && (
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center text-grey-950" aria-hidden>
          {icon}
        </div>
      )}
      <p className="w-full text-center font-semibold text-grey-950 text-[length:var(--font-size-paragraph-lg)] leading-[1.4]">
        {title}
      </p>
      {description != null && description !== "" && (
        <p className="w-full text-center font-medium text-grey-900 text-[length:var(--font-size-paragraph-md)] leading-[1.5]">
          {description}
        </p>
      )}
    </div>
  );
}
