"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/Button";
import { ProductListing } from "@/components/ProductListing";
import { useAuth } from "@/hooks/useAuth";
import {
  getBuyerOrders,
  getListing,
  getUserProfiles,
  type UserProfile,
} from "@/lib/firestore";
import type { Order } from "@/lib/schemas/order";
import type { Listing } from "@/lib/schemas/listing";
import { ROUTES } from "@/lib/routes";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  used: "Used",
  refurbished: "Refurbished",
};

function formatPrice(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })}`;
}

function OrdersEmptyState() {
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
          You should try buying something.
        </h2>
        <p className="font-semibold leading-[1.5] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-md)]">
          You'll see all your orders here after you make a purchase.
        </p>
      </div>
    </div>
  );
}

type OrderWithDetails = Order & {
  listing: Listing | null;
  sellerProfile: UserProfile | null;
};

function OrderCard({
  order,
  onBuyAgain,
}: {
  order: OrderWithDetails;
  onBuyAgain: () => void;
}) {
  const listing = order.listing;
  const imageSrc =
    listing?.imageUrls?.[0] ??
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='218' height='218'%3E%3Crect fill='%23f1f5f9' width='218' height='218'/%3E%3C/svg%3E";
  const condition =
    listing?.condition != null
      ? CONDITION_LABELS[listing.condition] ?? listing.condition
      : undefined;
  const sellerName =
    order.sellerProfile?.displayName ?? order.sellerProfile?.username ?? "Seller";
  const priceStr = formatPrice(order.unitPrice, order.currency);

  return (
    <div className="border-b border-slate-200">
      <ProductListing
        imageSrc={imageSrc}
        imageAlt={order.listingTitle}
        badge="NEW DROP"
        conditionLabel="Condition:"
        conditionValue={condition}
        title={order.listingTitle}
        price={priceStr}
        sellerAvatarSrc={order.sellerProfile?.avatarUrl ?? null}
        sellerName={sellerName}
        contentPosition="right"
        trailingContent={
          <Button
            size="small"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onBuyAgain();
            }}
          >
            Buy again
          </Button>
        }
        onClick={onBuyAgain}
      />
    </div>
  );
}

export default function ProfileOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getBuyerOrders(user.uid)
      .then(async (list) => {
        if (list.length === 0) {
          setOrders([]);
          return;
        }
        const listingIds = [...new Set(list.map((o) => o.listingId))];
        const sellerIds = [...new Set(list.map((o) => o.sellerId))];
        const [listings, profilesMap] = await Promise.all([
          Promise.all(listingIds.map((id) => getListing(id))),
          getUserProfiles(sellerIds),
        ]);
        const listingById = new Map<string | null, Listing | null>();
        listingIds.forEach((id, i) => listingById.set(id, listings[i] ?? null));
        const withDetails: OrderWithDetails[] = list.map((o) => ({
          ...o,
          listing: listingById.get(o.listingId) ?? null,
          sellerProfile: profilesMap.get(o.sellerId) ?? null,
        }));
        setOrders(withDetails);
      })
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const handleGoShop = () => router.push(ROUTES.shop);
  const pagePaddingBottom =
    "pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]";

  if (authLoading || loading) {
    return (
      <div
        className={`mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
      >
        <header className="flex h-[88px] shrink-0 items-center border-b border-slate-200 px-6">
          <h1 className="font-medium leading-[1.4] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-lg)]">
            Orders
          </h1>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
        <BottomNav activeItem="profile" />
      </div>
    );
  }

  const isEmpty = orders.length === 0;

  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}
    >
      <header className="flex h-[88px] shrink-0 items-center border-b border-slate-200 px-6">
        <h1 className="font-medium leading-[1.4] text-[var(--color-text-default-body)] text-[length:var(--font-size-paragraph-lg)]">
          Orders
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-auto">
        {isEmpty ? (
          <OrdersEmptyState />
        ) : (
          <div className="flex flex-col pb-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id ?? `order-${order.listingId}-${order.orderNumber}`}
                order={order}
                onBuyAgain={() =>
                  router.push(ROUTES.listingDetail(order.listingId))
                }
              />
            ))}
          </div>
        )}
      </main>

      <div className="flex shrink-0 flex-col gap-6 border-t border-slate-200 bg-white p-6">
        <Button
          size="medium"
          variant="default"
          className="w-full"
          onClick={handleGoShop}
        >
          Go shop
        </Button>
        <BottomNav activeItem="profile" />
      </div>
    </div>
  );
}
