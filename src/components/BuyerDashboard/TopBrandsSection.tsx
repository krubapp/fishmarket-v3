"use client";

import { Avatar } from "@/components/Avatar";
import type { UserProfile } from "@/lib/firestore";

export type TopBrandsSectionProps = {
  sellers: UserProfile[];
  className?: string;
};

export function TopBrandsSection({
  sellers,
  className = "",
}: TopBrandsSectionProps) {
  if (sellers.length === 0) return null;

  return (
    <section
      className={`flex flex-col gap-6 border-b border-[#f0f0f0] p-6 ${className}`}
    >
      <p className="font-medium text-[24px] leading-normal text-[#121212]">
        Top Brands
      </p>
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {sellers.map((seller) => (
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
