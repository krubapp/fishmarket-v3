"use client";

import { Avatar } from "@/components/Avatar";
import { Link } from "@/components/Link";
import type { UserProfile } from "@/lib/firestore";

export type SellerBrandSuggestionsSectionProps = {
  sellers: UserProfile[];
  onViewMore?: () => void;
  className?: string;
};

export function SellerBrandSuggestionsSection({
  sellers,
  onViewMore,
  className = "",
}: SellerBrandSuggestionsSectionProps) {
  if (sellers.length === 0) return null;

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

      {/* Horizontal scroll of brand avatars */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {sellers.map((seller) => (
          <Avatar
            key={seller.uid}
            size={80}
            src={seller.avatarUrl}
            label={seller.displayName ?? "Seller"}
          />
        ))}
      </div>
    </section>
  );
}
