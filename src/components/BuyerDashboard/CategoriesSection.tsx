"use client";

import Image from "next/image";

type CategoryRow = {
  fishType: string;
  label: string;
  image: string;
  position: { left: string; top: string; width: string; height: string };
};

const CATEGORIES: CategoryRow[] = [
  {
    fishType: "Perch",
    label: "Perch Lures",
    image: "/images/Perch.png",
    position: { left: "29%", top: "-23%", width: "94%", height: "167%" },
  },
  {
    fishType: "Pike",
    label: "Pike Lures",
    image: "/images/Pike.png",
    position: { left: "27%", top: "-56%", width: "135%", height: "241%" },
  },
  {
    fishType: "Zanders",
    label: "Zanders Lures",
    image: "/images/Zanders.png",
    position: { left: "38%", top: "-39%", width: "100%", height: "178%" },
  },
];

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
      {CATEGORIES.map((cat) => {
        const count = categoryCounts[cat.fishType];

        return (
          <button
            key={cat.fishType}
            onClick={() => onCategoryClick?.(cat.fishType)}
            className="relative flex h-[108px] w-full items-center overflow-clip border-0 bg-white px-6 py-[42px] text-left outline-none transition-[transform,opacity] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.99] disabled:active:scale-100"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute inset-0 z-1 bg-linear-to-r from-[rgba(255,255,255,0)] to-[rgba(10,10,10,0.3)]" />
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={cat.image}
                  alt=""
                  width={800}
                  height={400}
                  className="absolute max-w-none object-cover"
                  style={cat.position}
                  priority
                />
              </div>
            </div>

            <div className="relative z-2 flex h-[108px] flex-1 flex-col items-start justify-center gap-2">
              <p className="font-semibold text-[20px] leading-normal text-[#1e1e1e]">
                {cat.label}
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
