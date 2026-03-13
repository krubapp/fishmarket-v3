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
  MapComingSoonSection,
  BrandSuggestionsSection,
  BecauseYouLikeSection,
} from "@/components/BuyerDashboard";
import { SellerDashboard } from "@/components/SellerDashboard";
import { getSellers, getNewReleases, getUserFavoriteListings } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, profileLoading } = useAuth();
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [newReleases, setNewReleases] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSellers(20)
        .then(setSellers)
        .catch(() => {}),
      getNewReleases(10)
        .then((listings) => {
          setNewReleases(listings);
          setAllListings(listings);
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    getUserFavoriteListings(user.uid, 6)
      .then(setFavoriteListings)
      .catch(() => {});
  }, [user?.uid]);

  const isSeller = !!profile?.isSeller;
  const showSellerDashboard = isSeller;
  const recommendedListings = allListings.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24">
      <RootTopBar
        title={profile?.displayName ?? (isSeller ? "Seller" : "Home")}
        avatarSrc={profile?.avatarUrl}
        onAddProduct={
          isSeller ? () => router.push(ROUTES.createListingForm) : undefined
        }
        onSearch={() => router.push(`${ROUTES.shop}?search=1`)}
      />

      {showSellerDashboard ? (
        <div className="mx-auto w-full max-w-[480px]">
          <SellerDashboard sellerId={user!.uid} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
          <TopBrandsSection sellers={sellers} loading={loading} />
          <NewReleaseSection listings={newReleases} loading={loading} />
          <CategoriesSection
            onCategoryClick={(fishType) =>
              router.push(`${ROUTES.shop}?fishType=${fishType}`)
            }
          />

          <div className="flex flex-col gap-[54px] border-b border-[#e2e8f0] px-[24px]">
            <FavoritesSection
              listings={favoriteListings}
              loading={loading}
              onViewAll={() => router.push(ROUTES.profileFavorites)}
            />
            <PromoCTASection />
          </div>

          <MapComingSoonSection />
          <BrandSuggestionsSection sellers={sellers} loading={loading} />
          <BecauseYouLikeSection listings={recommendedListings} loading={loading} />
        </div>
      )}

      <BottomNav activeItem="home" />
    </div>
  );
}
