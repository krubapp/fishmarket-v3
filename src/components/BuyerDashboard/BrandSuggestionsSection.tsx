"use client";

import { SectionHeader } from "./SectionHeader";
import type { Listing } from "@/lib/schemas/listing";

export type BrandSuggestionsSectionProps = {
  listings: Listing[];
  className?: string;
};

export function BrandSuggestionsSection({
  listings,
  className = "",
}: BrandSuggestionsSectionProps) {
  if (listings.length === 0) return null;

  return (
    <section className={`flex flex-col gap-6 px-6 ${className}`}>
      <SectionHeader
        title="Brand suggestions"
        subtitle="Discover top brands other anglers trust."
      />

      <div className="flex flex-wrap gap-1">
        {listings.map((listing) => (
          <BrandCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}

function BrandCard({ listing }: { listing: Listing }) {
  const imageUrl = listing.imageUrls?.[0];

  return (
    <button className="h-[191px] w-[128px] shrink-0 overflow-hidden bg-white transition-[transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={listing.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-grey-200" />
      )}
    </button>
  );
}
