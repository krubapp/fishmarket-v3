"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/Badge";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/Button";
import { ContextTopBar } from "@/components/ContextTopBar";
import { ProductListing } from "@/components/ProductListing";
import { useAuth } from "@/hooks/useAuth";
import {
  getBuyerOrders,
  getListing,
  getUserProfiles,
  type UserProfile,
} from "@/lib/firestore";
import type { Order } from "@/lib/schemas/order";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE_VARIANT,
} from "@/lib/schemas/order";
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

function formatOrderDate(createdAt?: { seconds: number }): string | null {
  if (!createdAt?.seconds) return null;
  return new Date(createdAt.seconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  const priceStr = formatPrice(order.totalAmount, order.currency);
  const orderDate = formatOrderDate(order.createdAt);

  const conditionWithVariant = [
    condition,
    order.selectedVariantLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="border-b border-slate-200">
      <ProductListing
        imageSrc={imageSrc}
        imageAlt={order.listingTitle}
        badge={orderDate ?? undefined}
        conditionLabel="Condition:"
        conditionValue={conditionWithVariant || undefined}
        title={order.listingTitle}
        price={priceStr}
        originalPrice={
          order.quantity > 1
            ? `${order.quantity} × ${formatPrice(order.unitPrice, order.currency)}`
            : undefined
        }
        sellerAvatarSrc={order.sellerProfile?.avatarUrl ?? null}
        sellerName={sellerName}
        contentPosition="right"
        trailingContent={
          <div className="flex flex-col gap-2">
            <Badge variant={ORDER_STATUS_BADGE_VARIANT[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
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
          </div>
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
  const navHeight = "66px";
  const buttonBarBottom = `calc(${navHeight} + env(safe-area-inset-bottom, 0px))`;
  const mainPaddingForBottom =
    "pb-[calc(5.5rem+66px+env(safe-area-inset-bottom,0px))]";

  if (authLoading || loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col border-x border-slate-200 bg-white pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]">
        <ContextTopBar
          backLabel="Profile"
          title="Orders"
          onBack={() => router.push(ROUTES.profile)}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
        <BottomNav activeItem="profile" />
      </div>
    );
  }

  const isEmpty = orders.length === 0;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col border-x border-slate-200 bg-white pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]">
      <ContextTopBar
        backLabel="Profile"
        title="Orders"
        onBack={() => router.push(ROUTES.profile)}
      />

      <main
        className={`min-h-0 flex-1 overflow-auto ${mainPaddingForBottom}`}
      >
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

      <div
        className="fixed left-0 right-0 z-40 px-6 py-4"
        style={{ bottom: buttonBarBottom }}
      >
        <div className="mx-auto max-w-[320px]">
          <Button
            size="medium"
            variant="default"
            className="w-full"
            onClick={handleGoShop}
          >
            Go shop
          </Button>
        </div>
      </div>

      <BottomNav activeItem="profile" />
    </div>
  );
}
