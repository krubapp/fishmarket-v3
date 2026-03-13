"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Skeleton } from "@/components/Skeleton";
import { SectionHeader } from "./SectionHeader";
import type { Listing } from "@/lib/schemas/listing";
import { ROUTES } from "@/lib/routes";

export type FavoritesSectionProps = {
  listings: Listing[];
  loading?: boolean;
  onViewAll?: () => void;
  className?: string;
};

export function FavoritesSection({
  listings,
  loading,
  onViewAll,
  className = "",
}: FavoritesSectionProps) {
  if (!loading && listings.length === 0) return null;

  return (
    <section className={`flex flex-col gap-[21px] ${className}`}>
      {loading ? (
        <div className="flex flex-col gap-2 py-[10px]">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-52" />
        </div>
      ) : (
        <SectionHeader
          title="Favorites"
          subtitle="Don't forget the items you like"
          onViewAll={onViewAll}
          className="py-[10px]"
        />
      )}

      <div className="flex gap-[21px] overflow-x-auto scrollbar-none">
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex shrink-0 flex-col gap-2">
                <Skeleton className="h-[82px] w-[180px] rounded-[4px]" />
                <div className="flex w-[180px] flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))
          : listings.map((listing) => (
              <FavoriteCard key={listing.id} listing={listing} />
            ))}
      </div>
    </section>
  );
}

function FavoriteCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const imageUrl = listing.imageUrls?.[0];

  return (
    <div
      className="flex shrink-0 cursor-pointer flex-col gap-2"
      onClick={() => listing.id && router.push(ROUTES.listingDetail(listing.id))}
      role="link"
    >
      <div className="h-[82px] w-[180px] overflow-hidden rounded-[4px] bg-slate-100">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex w-[180px] flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="truncate font-semibold text-[14px] leading-[20px] text-[#121412]">
            {listing.title}
          </p>
          <div className="flex items-start gap-3 font-medium text-[14px]">
            <span className="leading-[20px] text-[#1e201e]">
              {listing.currency ?? "SEK"} {listing.price}
            </span>
            {listing.shippingCost != null && listing.shippingCost > 0 && (
              <span className="leading-[20px] text-[#8b9189] line-through">
                {listing.currency ?? "SEK"}{" "}
                {listing.price + listing.shippingCost}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Avatar size={16} />
          <span className="truncate font-medium text-[14px] leading-[20px] text-[#121412]">
            Seller
          </span>
        </div>
      </div>
    </div>
  );
}
