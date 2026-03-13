"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Skeleton } from "@/components/Skeleton";
import { SectionHeader } from "./SectionHeader";
import type { Listing } from "@/lib/schemas/listing";
import { ROUTES } from "@/lib/routes";

export type BecauseYouLikeSectionProps = {
  listings: Listing[];
  loading?: boolean;
  className?: string;
};

export function BecauseYouLikeSection({
  listings,
  loading,
  className = "",
}: BecauseYouLikeSectionProps) {
  if (!loading && listings.length === 0) return null;

  return (
    <section className={`flex flex-col gap-6 px-6 ${className}`}>
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-5 w-64" />
        </div>
      ) : (
        <SectionHeader
          title="Because you like"
          subtitle="Discover similar lures from other creators."
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-[194px] w-full rounded-[4px]" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))
          : listings.map((listing) => (
              <RecommendedCard key={listing.id} listing={listing} />
            ))}
      </div>
    </section>
  );
}

function RecommendedCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const imageUrl = listing.imageUrls?.[0];

  return (
    <div
      className="flex cursor-pointer flex-col gap-3"
      onClick={() => listing.id && router.push(ROUTES.listingDetail(listing.id))}
      role="link"
    >
      <div className="h-[194px] w-full overflow-hidden rounded-[4px] bg-slate-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-grey-200">
            <span className="text-grey-400 text-[14px]">No image</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 text-[14px]">
        <p className="truncate font-semibold text-[#0c0c0c]">
          {listing.title}
        </p>
        <div className="flex items-start gap-3 font-medium">
          <span className="text-[#787878]">
            {listing.currency ?? "SEK"} {listing.price}
          </span>
          {listing.shippingCost != null && listing.shippingCost > 0 && (
            <span className="text-[#a5a5a5] line-through">
              {listing.currency ?? "SEK"}{" "}
              {listing.price + listing.shippingCost}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Avatar size={16} />
        <span className="flex-1 truncate font-medium text-[14px] leading-normal text-[#3c3c3c]">
          Seller
        </span>
      </div>
    </div>
  );
}
