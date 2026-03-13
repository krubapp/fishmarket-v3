"use client";

import { Avatar } from "@/components/Avatar";
import { Skeleton } from "@/components/Skeleton";
import type { UserProfile } from "@/lib/firestore";

export type TopBrandsSectionProps = {
  sellers: UserProfile[];
  loading?: boolean;
  className?: string;
};

const TOP_BRANDS_LIMIT = 5;

export function TopBrandsSection({
  sellers,
  loading,
  className = "",
}: TopBrandsSectionProps) {
  const displaySellers = sellers.slice(0, TOP_BRANDS_LIMIT);
  if (!loading && displaySellers.length === 0) return null;

  return (
    <section
      className={`flex flex-col gap-6 border-b border-[#f0f0f0] p-[24px] ${className}`}
    >
      {loading ? (
        <Skeleton className="h-7 w-36" />
      ) : (
        <p className="font-medium text-[24px] leading-normal text-[#121212]">
          Top Brands
        </p>
      )}
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {loading
          ? Array.from({ length: TOP_BRANDS_LIMIT }, (_, i) => (
              <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))
          : displaySellers.map((seller) => (
              <Avatar
                key={seller.uid}
                src={seller.avatarUrl ?? null}
                alt={seller.displayName ?? seller.email}
                size={80}
                label={truncateName(seller.displayName ?? seller.email)}
                className="shrink-0"
              />
            ))}
      </div>
    </section>
  );
}

function truncateName(name: string, max = 12): string {
  if (name.length <= max) return name;
  return name.slice(0, max - 2) + "..";
}
