"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Link } from "@/components/Link";
import type { UserProfile } from "@/lib/firestore";
import { ROUTES } from "@/lib/routes";

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
  const router = useRouter();

  if (sellers.length === 0) return null;

  const handleSellerClick = (seller: UserProfile) => {
    const slug = seller.username && seller.username.trim().length > 0 ? seller.username : seller.uid;
    router.push(ROUTES.profileByUsername(slug));
  };

  return (
    <section
      className={`flex flex-col gap-6 overflow-hidden border-b border-slate-200 bg-white px-6 py-12 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="flex flex-1 flex-col">
          <p className="text-[24px] font-medium leading-[32px] text-[#121412]">
            Suggested brands
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
          <button
            key={seller.uid}
            type="button"
            onClick={() => handleSellerClick(seller)}
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 outline-none"
          >
            <Avatar
              size={80}
              src={seller.avatarUrl}
              label={seller.displayName ?? "Seller"}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
