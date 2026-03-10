"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import {
  TopBrandsSection,
  NewReleaseSection,
  CategoriesSection,
  FavoritesSection,
  PromoCTASection,
  BrandSuggestionsSection,
  BecauseYouLikeSection,
} from "@/components/BuyerDashboard";
import { getSellers, getNewReleases } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";

export default function BuyerDashboard() {
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [newReleases, setNewReleases] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);

  useEffect(() => {
    getSellers(20)
      .then(setSellers)
      .catch(() => {});
    getNewReleases(10)
      .then((listings) => {
        setNewReleases(listings);
        setAllListings(listings);
      })
      .catch(() => {});
  }, []);

  const favoriteListings = allListings.slice(0, 6);
  const recommendedListings = allListings.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24">
      <div className="mx-auto flex w-full max-w-[440px] flex-col gap-6">
        <TopBrandsSection sellers={sellers} />
        <NewReleaseSection listings={newReleases} />
        <CategoriesSection />
        <FavoritesSection listings={favoriteListings} />
        <PromoCTASection />
        <BrandSuggestionsSection sellers={sellers} />
        <BecauseYouLikeSection listings={recommendedListings} />
      </div>

      <BottomNav activeItem="home" />
    </div>
  );
}
