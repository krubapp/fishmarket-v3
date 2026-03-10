"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { RootTopBar } from "@/components/RootTopBar";
import {
  TopBrandsSection,
  NewReleaseSection,
  CategoriesSection,
  FavoritesSection,
  PromoCTASection,
  BrandSuggestionsSection,
  BecauseYouLikeSection,
} from "@/components/BuyerDashboard";
import { SellerDashboard } from "@/components/SellerDashboard";
import { getSellers, getNewReleases, getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [newReleases, setNewReleases] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

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

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    getUserProfile(user.uid).then(setProfile).catch(() => {});
  }, [user]);

  const isSeller = !!profile?.isSeller;
  const [viewMode, setViewMode] = useState<"seller" | "buyer">("seller");

  useEffect(() => {
    setViewMode(isSeller ? "seller" : "buyer");
  }, [isSeller]);

  const showSellerDashboard = isSeller && viewMode === "seller";
  const favoriteListings = allListings.slice(0, 6);
  const brandListings = allListings.slice(0, 6);
  const recommendedListings = allListings.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24">
      {isSeller && (
        <RootTopBar
          title={profile?.displayName ?? "Seller"}
          avatarSrc={profile?.avatarUrl}
          onAddProduct={() => router.push(ROUTES.createListingForm)}
          onFeed={() =>
            setViewMode((m) => (m === "seller" ? "buyer" : "seller"))
          }
          onSearch={() => router.push(ROUTES.searchListings)}
          feedActive={viewMode === "buyer"}
        />
      )}

      {showSellerDashboard ? (
        <div className="mx-auto w-full max-w-[440px]">
          <SellerDashboard sellerId={user!.uid} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-6">
          <TopBrandsSection sellers={sellers} />
          <NewReleaseSection listings={newReleases} />
          <CategoriesSection />

          <div className="flex flex-col gap-[54px] px-6">
            <FavoritesSection listings={favoriteListings} />
            <PromoCTASection />
          </div>

          <BrandSuggestionsSection listings={brandListings} />
          <BecauseYouLikeSection listings={recommendedListings} />
        </div>
      )}

      <BottomNav activeItem="home" />
    </div>
  );
}
