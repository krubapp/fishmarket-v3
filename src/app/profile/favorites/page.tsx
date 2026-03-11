"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/Button";
import { ProductListing } from "@/components/ProductListing";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserProfiles,
  type UserProfile,
} from "@/lib/firestore";
import type { Listing } from "@/lib/schemas/listing";
import { ROUTES } from "@/lib/routes";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  used: "Used",
  refurbished: "Refurbished",
};

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='218' height='218'%3E%3Crect fill='%23f1f5f9' width='218' height='218'/%3E%3C/svg%3E";

function formatPrice(price: number, currency: string): string {
  return `${currency} ${Number(price).toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

type FavoriteWithSeller = Listing & { sellerProfile: UserProfile | null };

function FavoritesEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-6">
      <div className="flex h-[318px] w-full max-w-[392px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
        <img
          src="/orders-placeholder.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="mt-6 flex flex-col gap-3 text-center">
        <h2 className="font-bold leading-[1.4] text-[var(--color-text-default-headings)] text-[length:var(--font-size-paragraph-lg)]">
          Haven't found the right product yet?
        </h2>
        <p className="font-semibold leading-[1.5] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-md)]">
          Here you'll find all the products you've liked.
        </p>
      </div>
    </div>
  );
}

function FavoriteCard({
  item,
  onRemove,
}: {
  item: FavoriteWithSeller;
  onRemove?: () => void;
}) {
  const router = useRouter();
  const imageSrc = item.imageUrls?.[0] ?? PLACEHOLDER_IMAGE;
  const condition =
    item.condition != null
      ? CONDITION_LABELS[item.condition] ?? item.condition
      : undefined;
  const sellerName =
    item.sellerProfile?.displayName ??
    item.sellerProfile?.username ??
    "Seller";
  const priceStr = formatPrice(item.price, item.currency ?? "SEK");
  const originalPriceStr =
    item.shippingCost != null && item.shippingCost > 0
      ? formatPrice(item.price + item.shippingCost, item.currency ?? "SEK")
      : undefined;

  return (
    <ProductListing
      imageSrc={imageSrc}
      imageAlt={item.title}
      badge="NEW DROP"
      conditionLabel="Condition:"
      conditionValue={condition}
      title={item.title}
      price={priceStr}
      originalPrice={originalPriceStr}
      sellerAvatarSrc={item.sellerProfile?.avatarUrl ?? null}
      sellerName={sellerName}
      contentPosition="below"
      onLike={onRemove}
      onClick={() => item.id && router.push(ROUTES.listingDetail(item.id))}
    />
  );
}

export default function ProfileFavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    // TODO: Replace with getFavoriteListings(user.uid) when favorites collection exists.
    const favoriteListingIds: string[] = [];
    if (favoriteListingIds.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    Promise.all(
      favoriteListingIds.map(async (id) => {
        const { getListing } = await import("@/lib/firestore");
        return getListing(id);
      })
    )
      .then((listings) => {
        const valid = listings.filter((l): l is Listing => l != null);
        const sellerIds = [...new Set(valid.map((l) => l.sellerId).filter(Boolean) as string[])];
        return Promise.all([
          Promise.resolve(valid),
          getUserProfiles(sellerIds),
        ] as const);
      })
      .then(([listings, profilesMap]: [Listing[], Map<string, UserProfile>]) => {
        const withSellers: FavoriteWithSeller[] = listings.map((listing) => ({
          ...listing,
          sellerProfile: listing.sellerId
            ? profilesMap.get(listing.sellerId) ?? null
            : null,
        }));
        setFavorites(withSellers);
      })
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const count = favorites.length;
  const isEmpty = count === 0;
  const pagePaddingBottom =
    "pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]";

  const handleRemoveFavorite = (listingId: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== listingId));
    // TODO: Remove from Firestore favorites when collection exists
  };

  if (loading) {
    return (
      <div
        className={`mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
      >
        <header className="flex h-[88px] shrink-0 items-center border-b border-slate-200 px-6">
          <h1 className="font-medium leading-[1.4] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-lg)]">
            Favorites
          </h1>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
        <BottomNav activeItem="profile" />
      </div>
    );
  }

  return (
    <div
      className={`mx-auto flex min-h-dvh w-full min-w-0 max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
    >
      <header className="flex h-[88px] shrink-0 items-center border-b border-slate-200 px-6">
        <h1 className="font-medium leading-[1.4] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-lg)]">
          Favorites ({count} products)
        </h1>
      </header>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto">
        {isEmpty ? (
          <FavoritesEmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-x-1 gap-y-1 pb-4">
            {favorites.map((item) => (
              <FavoriteCard
                key={item.id ?? item.title}
                item={item}
                onRemove={
                  item.id
                    ? () => handleRemoveFavorite(item.id!)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </main>

      <div className="flex shrink-0 flex-col gap-6 border-t border-slate-200 bg-white p-6">
        {isEmpty && (
          <Button
            size="medium"
            variant="default"
            className="w-full"
            onClick={() => router.push(ROUTES.searchListings)}
          >
            Go shop
          </Button>
        )}
        <BottomNav activeItem="profile" />
      </div>
    </div>
  );
}
