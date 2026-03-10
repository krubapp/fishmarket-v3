"use client";

import { Avatar } from "@/components/Avatar";
import { Link } from "@/components/Link";
import type { Listing } from "@/lib/schemas/listing";

export type SuggestedProductsSectionProps = {
  listings: Listing[];
  onViewMore?: () => void;
  className?: string;
};

export function SuggestedProductsSection({
  listings,
  onViewMore,
  className = "",
}: SuggestedProductsSectionProps) {
  if (listings.length === 0) return null;

  return (
    <section
      className={`flex flex-col gap-6 overflow-hidden border-b border-slate-200 bg-white px-6 py-12 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="flex flex-1 flex-col">
          <p className="text-[24px] font-medium leading-[32px] text-[#121412]">
            Suggested products
          </p>
          <p className="text-paragraph-md font-normal leading-normal text-[#1e201e]">
            Lure anglers are loving right now
          </p>
        </div>
        {onViewMore && (
          <Link size="medium" onClick={onViewMore}>
            View More
          </Link>
        )}
      </div>

      {/* Horizontal scroll of mini listing cards */}
      <div className="flex gap-4 overflow-x-auto scrollbar-none">
        {listings.map((listing) => (
          <SuggestedProductCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}

function SuggestedProductCard({ listing }: { listing: Listing }) {
  const imageUrl = listing.imageUrls?.[0];

  return (
    <div className="flex w-[180px] shrink-0 flex-col gap-2">
      {/* Image */}
      <div className="h-[82px] w-[180px] overflow-hidden rounded-[4px] bg-slate-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-slate-200" />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-paragraph-sm font-semibold leading-[1.43] text-[#121412]">
            {listing.title}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-paragraph-sm font-medium leading-[1.43] text-[#1e201e]">
              {listing.currency ?? "SEK"} {listing.price?.toLocaleString()}
            </span>
            {listing.price && (
              <span className="text-[14px] font-medium leading-[20px] text-[#8b9189] line-through">
                {listing.currency ?? "SEK"}{" "}
                {Math.round(listing.price * 1.1).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <Avatar size={16} label="Seller" labelPosition="right" />
      </div>
    </div>
  );
}
