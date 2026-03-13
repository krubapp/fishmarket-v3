"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContextTopBar } from "@/components/ContextTopBar";
import { Button } from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { Snackbar } from "@/components/Snackbar";
import { useAuth } from "@/hooks/useAuth";
import { useCartContext } from "@/contexts/CartContext";
import {
  getCart,
  getListingsByIds,
  getUserProfiles,
  type UserProfile,
} from "@/lib/firestore";
import type { CartItem } from "@/lib/schemas/cart";
import type { Listing } from "@/lib/schemas/listing";
import { ROUTES } from "@/lib/routes";
import { getAuthHeaders } from "@/lib/firebase";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='218' height='218'%3E%3Crect fill='%23f1f5f9' width='218' height='218'/%3E%3C/svg%3E";

function formatPrice(price: number, currency: string): string {
  return `${currency} ${Number(price).toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

type CartLine = {
  item: CartItem;
  listing: Listing | null;
  seller: UserProfile | null;
  unitPrice: number;
  variantLabel: string;
};

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const cartContext = useCartContext();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [errorSnackbar, setErrorSnackbar] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!user?.uid) {
      setLines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const cart = await getCart(user.uid);
      if (cart.items.length === 0) {
        setLines([]);
        setLoading(false);
        return;
      }
      const listingIds = [...new Set(cart.items.map((i) => i.listingId))];
      const listingsMap = await getListingsByIds(listingIds);
      const sellerIds = [...new Set(
        Array.from(listingsMap.values())
          .map((l) => l.sellerId)
          .filter(Boolean) as string[],
      )];
      const profilesMap = await getUserProfiles(sellerIds);

      const result: CartLine[] = [];
      for (const item of cart.items) {
        const listing = listingsMap.get(item.listingId) ?? null;
        const seller = listing?.sellerId
          ? profilesMap.get(listing.sellerId) ?? null
          : null;
        let unitPrice = listing?.price ?? 0;
        let variantLabel = "";
        if (item.variantValueId && listing?.variants) {
          for (const group of listing.variants) {
            const val = group.values.find((v) => v.id === item.variantValueId);
            if (val) {
              if (val.price > 0) unitPrice = val.price;
              variantLabel = `${group.name}: ${val.name}`;
              break;
            }
          }
        }
        result.push({ item, listing, seller, unitPrice, variantLabel });
      }
      setLines(result);
    } catch {
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const bySeller = new Map<string, CartLine[]>();
  for (const line of lines) {
    const sid = line.listing?.sellerId ?? "unknown";
    if (!bySeller.has(sid)) bySeller.set(sid, []);
    bySeller.get(sid)!.push(line);
  }

  async function handleCheckout(sellerId: string) {
    if (!user) return;
    setCheckingOut(sellerId);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          buyerId: user.uid,
          cart: true,
          sellerId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorSnackbar(data.error || "Checkout failed");
      }
    } catch {
      setErrorSnackbar("Checkout failed");
    } finally {
      setCheckingOut(null);
    }
  }

  const pagePaddingBottom = "pb-[max(7.5rem,env(safe-area-inset-bottom)+5rem)]";

  if (!user) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white">
        <ContextTopBar title="Cart" onBack={() => router.back()} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-grey-500 text-center">Sign in to view your cart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto flex min-h-dvh max-w-[440px] flex-col border-x border-slate-200 bg-white ${pagePaddingBottom}`}>
      <ContextTopBar
        backLabel="Shop"
        title="Cart"
        onBack={() => router.back()}
      />

      {loading ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center px-6 pt-6">
          <div className="flex flex-col gap-4 text-center">
            <p className="font-medium text-grey-700 text-[length:var(--font-size-body-md)]">
              Your cart is empty
            </p>
            <Link href={ROUTES.shop}>
              <Button size="medium">Go to shop</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-8 px-6 py-6">
          {Array.from(bySeller.entries()).map(([sellerId, sellerLines]) => {
            const seller = sellerLines[0]?.seller;
            const sellerName =
              seller?.displayName ?? seller?.username ?? "Seller";
            const subtotal = sellerLines.reduce(
              (sum, l) => sum + l.unitPrice * l.item.quantity,
              0,
            );
            const shipping = sellerLines.reduce(
              (sum, l) => sum + (l.listing?.shippingCost ?? 0),
              0,
            );
            const total = subtotal + shipping;

            return (
              <section key={sellerId} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900 text-[length:var(--font-size-body-md)]">
                    {sellerName}
                  </h2>
                </div>
                <ul className="flex flex-col gap-3">
                  {sellerLines.map((line, idx) => (
                    <li
                      key={`${line.item.listingId}-${line.item.variantValueId ?? ""}-${idx}`}
                      className="flex gap-4 rounded-lg border border-slate-200 p-3"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
                        <img
                          src={
                            line.listing?.imageUrls?.[0] ?? PLACEHOLDER_IMAGE
                          }
                          alt={line.listing?.title ?? ""}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-[length:var(--font-size-paragraph-md)] truncate">
                          {line.listing?.title ?? "—"}
                        </p>
                        {line.variantLabel ? (
                          <p className="text-grey-600 text-[length:var(--font-size-paragraph-sm)]">
                            {line.variantLabel}
                          </p>
                        ) : null}
                        <p className="mt-1 font-medium text-slate-800 text-[length:var(--font-size-paragraph-sm)]">
                          {formatPrice(line.unitPrice * line.item.quantity, line.listing?.currency ?? "SEK")}
                          {line.item.quantity > 1 ? ` × ${line.item.quantity}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-900 text-[length:var(--font-size-body-md)]">
                    Total {formatPrice(total, sellerLines[0]?.listing?.currency ?? "SEK")}
                  </span>
                  <Button
                    size="medium"
                    loading={checkingOut === sellerId}
                    disabled={!!checkingOut}
                    onClick={() => handleCheckout(sellerId)}
                  >
                    Checkout
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Snackbar
        open={!!errorSnackbar}
        onClose={() => setErrorSnackbar(null)}
        message={errorSnackbar ?? ""}
        icon="error"
        duration={5000}
      />
      <BottomNav activeItem="shop" />
    </div>
  );
}
