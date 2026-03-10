"use client";

import { useRef, useState, useCallback } from "react";
import { Avatar } from "@/components/Avatar";
import type { Listing } from "@/lib/schemas/listing";

export type NewReleaseSectionProps = {
  listings: Listing[];
  className?: string;
};

export function NewReleaseSection({
  listings,
  className = "",
}: NewReleaseSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.scrollWidth / Math.max(listings.length, 1);
    setActiveIndex(Math.round(scrollLeft / cardWidth));
  }, [listings.length]);

  if (listings.length === 0) return null;

  return (
    <section className={`flex flex-col gap-6 ${className}`}>
      <div className="flex flex-col gap-[5px] px-6">
        <p className="font-medium text-[24px] leading-normal text-[#121212]">
          New Release
        </p>
        <p className="font-medium text-[16px] leading-normal text-[#3c3c3c]">
          Here&apos;s some new drops
        </p>
      </div>

      <div className="overflow-hidden px-6">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-none"
        >
          {listings.map((listing) => (
            <NewReleaseCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      {listings.length > 1 && (
        <div className="flex items-center justify-center gap-1 px-6 py-1">
          {listings.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-11 rounded-full transition-colors ${
                i === activeIndex ? "bg-[#060606]" : "bg-[#a5a5a5]"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NewReleaseCard({ listing }: { listing: Listing }) {
  const imageUrl = listing.imageUrls?.[0];

  return (
    <div className="w-full shrink-0 snap-center">
      <div className="flex flex-col">
        {/* Blurred background image */}
        <div className="relative h-[170px] w-full overflow-hidden rounded-t-[4px]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover blur-[10px]"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-200" />
          )}
        </div>

        {/* Info panel */}
        <div className="flex gap-6 px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="font-medium text-[16px] text-[#660008] underline font-['Oswald',sans-serif]">
                New Release
              </span>
              <span className="rounded-[4px] bg-[#f0f0f0] px-1 py-0.5 font-medium text-[14px] text-[#0c0c0c]">
                Premium
              </span>
            </div>
            <p className="truncate font-semibold text-[20px] leading-normal text-[#060606]">
              {listing.title}
            </p>
            <div className="flex items-center gap-2">
              <Avatar size={16} />
              <span className="truncate text-[14px] font-normal text-[#1e1e1e]">
                {listing.sellerId ?? "Seller"}
              </span>
            </div>
          </div>
          <span className="shrink-0 font-semibold text-[20px] leading-normal text-[#660008]">
            {listing.currency ?? "SEK"} {listing.price}
          </span>
        </div>
      </div>
    </div>
  );
}
