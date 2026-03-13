"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { SectionHeader } from "./SectionHeader";
import type { UserProfile } from "@/lib/firestore";
import { ROUTES } from "@/lib/routes";

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

      <div className="grid grid-cols-2 gap-4">
        {sellers.map((seller) => (
          <SellerCard key={seller.uid} seller={seller} />
        ))}
      </div>
    </section>
  );
}

function SellerCard({ seller }: { seller: UserProfile }) {
  const router = useRouter();
  const name = seller.displayName || seller.email;

  return (
    <button
      className="flex flex-col items-center gap-3 rounded-[8px] border border-[#E2E8F0] bg-white px-4 py-5 transition-[transform,background-color] duration-(--duration-press) ease-(--ease-spring) hover:bg-slate-50 active:scale-[0.97]"
      onClick={() =>
        router.push(
          ROUTES.profileByUsername(seller.username || seller.uid),
        )
      }
    >
      <Avatar
        src={seller.avatarUrl ?? null}
        alt={name}
        size={80}
      />
      <div className="flex w-full flex-col items-center gap-0.5 overflow-hidden">
        <p className="w-full truncate text-center font-semibold text-[14px] leading-normal text-[#0c0c0c]">
          {name}
        </p>
        {seller.username && (
          <p className="w-full truncate text-center font-medium text-[13px] leading-normal text-[#787878]">
            @{seller.username}
          </p>
        )}
      </div>
    </button>
  );
}
