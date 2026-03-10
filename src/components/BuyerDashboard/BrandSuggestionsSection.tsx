"use client";

import { Avatar } from "@/components/Avatar";
import { SectionHeader } from "./SectionHeader";
import type { UserProfile } from "@/lib/firestore";

export type BrandSuggestionsSectionProps = {
  sellers: UserProfile[];
  className?: string;
};

export function BrandSuggestionsSection({
  sellers,
  className = "",
}: BrandSuggestionsSectionProps) {
  if (sellers.length === 0) return null;

  return (
    <section className={`flex flex-col gap-6 px-6 ${className}`}>
      <SectionHeader
        title="Brand suggestions"
        subtitle="Discover top brands other anglers trust."
      />

      <div className="flex flex-wrap gap-1">
        {sellers.map((seller) => (
          <BrandCard key={seller.uid} seller={seller} />
        ))}
      </div>
    </section>
  );
}

function BrandCard({ seller }: { seller: UserProfile }) {
  return (
    <button className="relative h-[191px] w-[128px] overflow-hidden bg-white transition-[transform] duration-(--duration-press) ease-(--ease-spring) active:scale-[0.97]">
      <div className="absolute inset-0 flex items-center justify-center">
        <Avatar
          src={seller.avatarUrl ?? null}
          alt={seller.displayName ?? seller.email}
          size={80}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-2">
        <p className="truncate text-center font-medium text-[12px] text-white">
          {seller.displayName ?? seller.email}
        </p>
      </div>
    </button>
  );
}
