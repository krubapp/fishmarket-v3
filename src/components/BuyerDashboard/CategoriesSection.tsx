"use client";

import { FISH_TYPES } from "@/lib/schemas/listing";

const CATEGORY_IMAGES: Record<string, string> = {
  Perch:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=60",
  Pike: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=60",
  Bass: "https://images.unsplash.com/photo-1509803874385-db7c23652552?w=800&auto=format&fit=crop&q=60",
  Salmon:
    "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=800&auto=format&fit=crop&q=60",
  Trout:
    "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&auto=format&fit=crop&q=60",
};

const DISPLAY_TYPES = FISH_TYPES.filter((t) => t !== "Other");

export type CategoriesSectionProps = {
  categoryCounts?: Record<string, number>;
  onCategoryClick?: (fishType: string) => void;
  className?: string;
};

export function CategoriesSection({
  categoryCounts = {},
  onCategoryClick,
  className = "",
}: CategoriesSectionProps) {
  return (
    <section className={`flex flex-col gap-1 ${className}`}>
      {DISPLAY_TYPES.map((fishType) => {
        const count = categoryCounts[fishType];
        const imageUrl = CATEGORY_IMAGES[fishType];

        return (
          <button
            key={fishType}
            onClick={() => onCategoryClick?.(fishType)}
            className="relative flex h-[108px] w-full items-center overflow-hidden px-6 py-[42px] text-left transition-[transform,opacity] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.99] disabled:active:scale-100"
          >
            {/* Background image + gradient overlay */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(10,10,10,0.3)]" />
              {imageUrl && (
                <div className="absolute inset-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt=""
                    className="absolute right-0 top-1/2 h-[180%] w-auto max-w-none -translate-y-1/2 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="relative flex flex-1 flex-col gap-2 items-start justify-center">
              <p className="font-semibold text-[20px] leading-normal text-[#1e1e1e]">
                {fishType} Lures
              </p>
              {count != null && count > 0 && (
                <span className="rounded-[4px] bg-[#f0f0f0] px-1 py-0.5 font-medium text-[14px] text-[#0c0c0c]">
                  {count} Lures
                </span>
              )}
            </div>
          </button>
        );
      })}
    </section>
  );
}
