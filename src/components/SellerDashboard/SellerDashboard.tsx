"use client";

import { useEffect, useState } from "react";
import { TrackInventoryCard } from "@/components/TrackInventoryCard";
import { useSellerAnalytics } from "@/hooks/useSellerAnalytics";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useSellerInventory } from "@/hooks/useSellerInventory";
import { getNewReleases, getSellers, getUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import { StripeAccountCard } from "./StripeAccountCard";
import { EarningBalanceSection } from "./EarningBalanceSection";
import { OrdersSection } from "./OrdersSection";
import { SuggestedProductsSection } from "./SuggestedProductsSection";
import { SellerBrandSuggestionsSection } from "./SellerBrandSuggestionsSection";

export type SellerDashboardProps = {
  sellerId: string;
  className?: string;
};

export function SellerDashboard({
  sellerId,
  className = "",
}: SellerDashboardProps) {
  const {
    data: analytics,
    isLoading: analyticsLoading,
  } = useSellerAnalytics(sellerId);

  const {
    data: orders,
    isLoading: ordersLoading,
  } = useSellerOrders(sellerId);

  const {
    data: inventoryItems,
    isLoading: inventoryLoading,
  } = useSellerInventory(sellerId);

  const [suggestedListings, setSuggestedListings] = useState<Listing[]>([]);
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [stripeOnboardingComplete, setStripeOnboardingComplete] =
    useState(false);

  useEffect(() => {
    getNewReleases(10)
      .then(setSuggestedListings)
      .catch(() => {});
    getSellers(10)
      .then(setSellers)
      .catch(() => {});
    getUserProfile(sellerId)
      .then((profile) => {
        if (profile?.stripeOnboardingComplete) {
          setStripeOnboardingComplete(true);
        }
      })
      .catch(() => {});
  }, [sellerId]);

  return (
    <div className={`flex flex-col ${className}`}>
      <StripeAccountCard
        uid={sellerId}
        stripeOnboardingComplete={stripeOnboardingComplete}
      />
      <EarningBalanceSection
        analytics={analytics}
        isLoading={analyticsLoading}
      />
      <TrackInventoryCard
        items={inventoryLoading ? [] : (inventoryItems ?? [])}
        actionLabel="View More"
        className="max-w-none"
      />
      <OrdersSection
        orders={orders ?? []}
        isLoading={ordersLoading}
      />
      <SuggestedProductsSection listings={suggestedListings} />
      <SellerBrandSuggestionsSection sellers={sellers} />
    </div>
  );
}
